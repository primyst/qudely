from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
import base64
import requests
from PIL import Image
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)

# ✅ Cache-friendly model storage for Render (persists in /tmp)
MODEL_DIR = "/tmp/colorize_models"
PROTO_PATH = os.path.join(MODEL_DIR, "colorization_deploy_v2.prototxt")
MODEL_PATH = os.path.join(MODEL_DIR, "colorization_release_v2.caffemodel")
PTS_PATH = os.path.join(MODEL_DIR, "pts_in_hull.npy")

# Model asset URLs (Rich Zhang’s pretrained OpenCV colorization)
PROTO_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/models/colorization_deploy_v2.prototxt"
MODEL_URL = "https://huggingface.co/spaces/akhaliq/colorization/resolve/main/colorization_release_v2.caffemodel"
PTS_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/resources/pts_in_hull.npy"


# ---------- UTILITIES ----------
def ensure_models():
    """Ensure model files exist; download once if missing."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not os.path.exists(PROTO_PATH):
        print("📥 Downloading prototxt...")
        r = requests.get(PROTO_URL, timeout=60)
        r.raise_for_status()
        with open(PROTO_PATH, "wb") as f:
            f.write(r.content)

    if not os.path.exists(MODEL_PATH):
        print("📥 Downloading colorization model (~160MB)...")
        r = requests.get(MODEL_URL, stream=True, timeout=300)
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    if not os.path.exists(PTS_PATH):
        print("📥 Downloading pts_in_hull.npy...")
        r = requests.get(PTS_URL, timeout=60)
        r.raise_for_status()
        with open(PTS_PATH, "wb") as f:
            f.write(r.content)


def read_image_from_file_storage(fs):
    in_bytes = fs.read()
    arr = np.frombuffer(in_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img


# ---------- BASIC RESTORATION ----------
def restore_basic(img_bgr: np.ndarray) -> np.ndarray:
    """Remove scratches, denoise, and slightly enhance."""
    img = img_bgr.copy()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise using bilateral filter (retains edges)
    den = cv2.bilateralFilter(img, d=7, sigmaColor=75, sigmaSpace=75)

    # Detect small dark scratches
    edges = cv2.Canny(gray, 50, 150)
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.dilate(edges, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    # Inpaint to fill thin scratch gaps
    inpainted = cv2.inpaint(den, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

    # Light detail enhancement for clarity
    enhanced = cv2.detailEnhance(inpainted, sigma_s=10, sigma_r=0.15)

    return enhanced


# ---------- ENHANCED COLORIZATION ----------
def colorize_opencv(img_bgr: np.ndarray) -> np.ndarray:
    """Enhanced OpenCV colorization (Rich Zhang) with color correction."""
    ensure_models()
    net = cv2.dnn.readNetFromCaffe(PROTO_PATH, MODEL_PATH)
    pts = np.load(PTS_PATH)

    # Register cluster centers
    class8 = net.getLayerId("class8_ab")
    conv8 = net.getLayerId("conv8_313_rh")
    pts = pts.transpose().reshape(2, 313, 1, 1)
    net.getLayer(class8).blobs = [pts.astype(np.float32)]
    net.getLayer(conv8).blobs = [np.full((1, 313, 1, 1), 2.606, dtype=np.float32)]

    # --- Prepare input ---
    h_in, w_in = 224, 224
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2Lab)
    l_channel = img_lab[:, :, 0]
    L = cv2.resize(l_channel, (w_in, h_in))
    L -= 50  # normalize around mean

    net.setInput(cv2.dnn.blobFromImage(L))
    ab_dec = net.forward()[0].transpose((1, 2, 0))
    ab_dec_us = cv2.resize(ab_dec, (img_bgr.shape[1], img_bgr.shape[0]))

    # Merge channels back
    lab_out = np.zeros_like(img_lab, dtype=np.float32)
    lab_out[:, :, 0] = l_channel
    lab_out[:, :, 1:] = ab_dec_us
    img_bgr_out = cv2.cvtColor(lab_out.astype(np.uint8), cv2.COLOR_Lab2BGR)

    # --- Post enhancements ---
    hsv = cv2.cvtColor(img_bgr_out, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.5, 0, 255)  # boost saturation
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.15, 0, 255)  # slight brightness lift
    img_bgr_out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    # Blend edges from original to sharpen slightly
    edges = cv2.Canny(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY), 60, 150)
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    img_bgr_out = cv2.addWeighted(img_bgr_out, 0.92, edges_colored, 0.08, 0)

    return img_bgr_out


# ---------- OUTPUT UTILITY ----------
def bgr_to_datauri(img_bgr: np.ndarray) -> str:
    _, buf = cv2.imencode(".png", img_bgr)
    b64 = base64.b64encode(buf.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


# ---------- ROUTES ----------
@app.route("/")
def home():
    return jsonify({"status": "ok", "service": "Qudely AI Restore (Upgraded)"}), 200


@app.route("/restore", methods=["POST"])
def restore_route():
    try:
        if "file" in request.files:
            fs = request.files["file"]
            img = read_image_from_file_storage(fs)
            if img is None:
                return jsonify({"error": "Could not decode uploaded image"}), 400
        else:
            data = request.get_json(force=True, silent=True)
            if not data or "imageUrl" not in data:
                return jsonify({"error": "Missing file or imageUrl"}), 400
            image_url = data["imageUrl"]
            r = requests.get(image_url, timeout=30)
            r.raise_for_status()
            arr = np.frombuffer(r.content, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if img is None:
                return jsonify({"error": "Could not fetch/parse image URL"}), 400

        restored = restore_basic(img)

        try:
            colorized = colorize_opencv(restored)
        except Exception as e:
            print("Colorization error:", e)
            colorized = restored

        datauri = bgr_to_datauri(colorized)
        return jsonify({"restored": datauri}), 200

    except requests.HTTPError as e:
        return jsonify({"error": f"Failed to fetch image URL: {str(e)}"}), 400
    except Exception as e:
        print("Server error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)),debug=False)