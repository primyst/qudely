from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import requests
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)

# === Model file paths ===
MODEL_DIR = "/tmp/colorize_models"
PROTO_PATH = os.path.join(MODEL_DIR, "colorization_deploy_v2.prototxt")
MODEL_PATH = os.path.join(MODEL_DIR, "colorization_release_v2.caffemodel")
PTS_PATH = os.path.join(MODEL_DIR, "pts_in_hull.npy")

# === Remote URLs (Rich Zhang Colorization model) ===
PROTO_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/models/colorization_deploy_v2.prototxt"
MODEL_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/models/colorization_release_v2.caffemodel"
PTS_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/resources/pts_in_hull.npy"


# ======================================================
# Utilities
# ======================================================

def ensure_models():
    """Download model files if missing."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not os.path.exists(PROTO_PATH):
        print("Downloading prototxt...")
        r = requests.get(PROTO_URL, timeout=60)
        r.raise_for_status()
        with open(PROTO_PATH, "wb") as f:
            f.write(r.content)

    if not os.path.exists(MODEL_PATH):
        print("Downloading caffemodel (≈160MB)...")
        r = requests.get(MODEL_URL, stream=True, timeout=300)
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    if not os.path.exists(PTS_PATH):
        print("Downloading pts_in_hull.npy...")
        r = requests.get(PTS_URL, timeout=60)
        r.raise_for_status()
        with open(PTS_PATH, "wb") as f:
            f.write(r.content)


def read_image_from_file_storage(fs):
    """Convert uploaded FileStorage object to OpenCV BGR image."""
    arr = np.frombuffer(fs.read(), np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def restore_basic(img_bgr: np.ndarray) -> np.ndarray:
    """
    Denoise + remove scratches using morphological and inpainting methods.
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Denoise with bilateral filter
    den = cv2.bilateralFilter(img_bgr, d=7, sigmaColor=75, sigmaSpace=75)

    # Detect possible scratches using edge detection
    edges = cv2.Canny(gray, 50, 150)
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.dilate(edges, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)

    # Inpaint scratches
    inpainted = cv2.inpaint(den, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    return inpainted


def colorize_opencv(img_bgr: np.ndarray) -> np.ndarray:
    """
    Colorize grayscale image using Rich Zhang colorization model.
    """
    ensure_models()
    net = cv2.dnn.readNetFromCaffe(PROTO_PATH, MODEL_PATH)
    pts = np.load(PTS_PATH)  # (313, 2)

    # Add cluster centers to network
    class8 = net.getLayerId("class8_ab")
    conv8 = net.getLayerId("conv8_313_rh")
    pts = pts.transpose().reshape(2, 313, 1, 1)
    net.getLayer(class8).blobs = [pts.astype(np.float32)]
    net.getLayer(conv8).blobs = [np.full((1, 313, 1, 1), 2.606, dtype=np.float32)]

    # Convert to Lab color space
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2Lab)
    L = img_lab[:, :, 0]

    # Resize to model input size
    L_rs = cv2.resize(L, (224, 224))
    L_rs -= 50
    net.setInput(cv2.dnn.blobFromImage(L_rs))
    ab_dec = net.forward()[0, :, :, :].transpose((1, 2, 0))
    ab_dec_us = cv2.resize(ab_dec, (img_bgr.shape[1], img_bgr.shape[0]))

    # Merge with original L channel
    lab_out = np.zeros((img_bgr.shape[0], img_bgr.shape[1], 3), dtype=np.float32)
    lab_out[:, :, 0] = L
    lab_out[:, :, 1:] = ab_dec_us

    img_bgr_out = cv2.cvtColor(lab_out.astype("uint8"), cv2.COLOR_Lab2BGR)
    img_bgr_out = np.clip(img_bgr_out, 0, 255).astype("uint8")
    return img_bgr_out


def bgr_to_datauri(img_bgr: np.ndarray) -> str:
    """Convert BGR OpenCV image to Base64 data URI."""
    _, buf = cv2.imencode(".png", img_bgr)
    b64 = base64.b64encode(buf.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


# ======================================================
# Routes
# ======================================================

@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "Qudely Photo Restore API (Colorizer)"}), 200


@app.route("/restore", methods=["POST"])
def restore_route():
    """
    Accepts:
      - multipart/form-data with key "file"
      - or JSON {"imageUrl": "..."}
    Returns:
      { "restored": "data:image/png;base64,..." }
    """
    try:
        # 1️⃣ Get image (upload or URL)
        if "file" in request.files:
            fs = request.files["file"]
            img = read_image_from_file_storage(fs)
        else:
            data = request.get_json(force=True, silent=True)
            if not data or "imageUrl" not in data:
                return jsonify({"error": "Missing file upload or imageUrl"}), 400
            image_url = data["imageUrl"]
            r = requests.get(image_url, timeout=30)
            r.raise_for_status()
            arr = np.frombuffer(r.content, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Invalid or unreadable image"}), 400

        # 2️⃣ Basic restoration
        restored = restore_basic(img)

        # 3️⃣ Convert to grayscale for stable colorization
        gray_restored = cv2.cvtColor(restored, cv2.COLOR_BGR2GRAY)
        gray_restored = cv2.convertScaleAbs(gray_restored, alpha=1.1, beta=10)  # enhance contrast
        gray_restored = cv2.cvtColor(gray_restored, cv2.COLOR_GRAY2BGR)

        # 4️⃣ Colorize to normal
        try:
            colorized = colorize_opencv(gray_restored)
        except Exception as e:
            print("Colorization failed:", e)
            colorized = restored

        # 5️⃣ Encode result
        datauri = bgr_to_datauri(colorized)
        return jsonify({"restored": datauri}), 200

    except requests.HTTPError as e:
        return jsonify({"error": f"Failed to fetch image URL: {str(e)}"}), 400
    except Exception as e:
        print("Server error:", e)
        return jsonify({"error": str(e)}), 500


# ======================================================
# Entry
# ======================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))