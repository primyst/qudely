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

# Where we store downloaded DNN files
MODEL_DIR = "/tmp/colorize_models"
PROTO_PATH = os.path.join(MODEL_DIR, "colorization_deploy_v2.prototxt")
MODEL_PATH = os.path.join(MODEL_DIR, "colorization_release_v2.caffemodel")
PTS_PATH = os.path.join(MODEL_DIR, "pts_in_hull.npy")

# URLs (raw) for model assets (Rich Zhang colorization)
PROTO_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/models/colorization_deploy_v2.prototxt"
MODEL_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/models/colorization_release_v2.caffemodel"
PTS_URL = "https://raw.githubusercontent.com/richzhang/colorization/master/resources/pts_in_hull.npy"

def ensure_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    # Download files if missing
    if not os.path.exists(PROTO_PATH):
        print("Downloading prototxt...")
        r = requests.get(PROTO_URL, timeout=60)
        r.raise_for_status()
        with open(PROTO_PATH, "wb") as f:
            f.write(r.content)
    if not os.path.exists(MODEL_PATH):
        print("Downloading caffemodel (this is large, ~160MB)...")
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
    # fs is werkzeug FileStorage
    in_bytes = fs.read()
    arr = np.frombuffer(in_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img

def restore_basic(img_bgr: np.ndarray) -> np.ndarray:
    """
    Simple restoration:
    - Denoise with bilateral filter
    - Detect thin dark scratches via morphological operations on grayscale edges
    - Inpaint using Telea
    Return restored BGR image.
    """
    img = img_bgr.copy()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Denoise
    den = cv2.bilateralFilter(img, d=7, sigmaColor=75, sigmaSpace=75)

    # Edge detection for possible scratches
    edges = cv2.Canny(gray, 50, 150)
    # Dilate edges to create mask
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.dilate(edges, kernel, iterations=2)

    # Morphological closing to connect broken lines
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)

    # Inpaint
    inpainted = cv2.inpaint(den, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

    return inpainted

def colorize_opencv(img_bgr: np.ndarray) -> np.ndarray:
    """
    Colorize using Rich Zhang colorization model with OpenCV DNN.
    Input: BGR image (uint8)
    Output: colorized BGR (uint8)
    """
    ensure_models()
    net = cv2.dnn.readNetFromCaffe(PROTO_PATH, MODEL_PATH)
    pts = np.load(PTS_PATH)  # (313,2)

    # populate cluster centers as 1x1 conv layer
    class8 = net.getLayerId("class8_ab")
    conv8 = net.getLayerId("conv8_313_rh")

    pts = pts.transpose().reshape(2, 313, 1, 1)
    net.getLayer(class8).blobs = [pts.astype(np.float32)]
    net.getLayer(conv8).blobs = [np.full((1,313,1,1), 2.606, dtype=np.float32)]

    # prepare input
    h_in = 224
    w_in = 224
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype("float32") / 255.0
    img_lab = cv2.cvtColor((img_norm*255).astype("uint8"), cv2.COLOR_RGB2LAB).astype("float32")
    l = img_lab[:,:,0]
    L = cv2.resize(l, (w_in, h_in))
    L -= 50

    net.setInput(cv2.dnn.blobFromImage(L))
    ab_dec = net.forward()[0,:,:,:].transpose((1,2,0))  # HxWx2
    ab_dec_us = cv2.resize(ab_dec, (img_bgr.shape[1], img_bgr.shape[0]))

    L_orig = img_lab[:,:,0]
    lab_out = np.zeros((img_bgr.shape[0], img_bgr.shape[1], 3), dtype=np.float32)
    lab_out[:,:,0] = L_orig
    lab_out[:,:,1:] = ab_dec_us
    img_bgr_out = cv2.cvtColor(lab_out.astype("uint8"), cv2.COLOR_LAB2BGR)
    # ensure valid range
    img_bgr_out = np.clip(img_bgr_out, 0, 255).astype("uint8")
    return img_bgr_out

def bgr_to_datauri(img_bgr: np.ndarray) -> str:
    _, buf = cv2.imencode(".png", img_bgr)
    b64 = base64.b64encode(buf.tobytes()).decode("utf-8")
    return f"data:image/png;base64,{b64}"

@app.route("/")
def home():
    return jsonify({"status": "ok", "note": "Qudely local restore service (OpenCV)"}), 200

@app.route("/restore", methods=["POST"])
def restore_route():
    """
    Accepts:
      - multipart/form-data with key "file" containing an image (preferred)
      - or JSON {"imageUrl": "..."} where we fetch the image and process it
    Returns:
      { "restored": "data:image/png;base64,..." }
    """
    try:
        # 1) Accept file upload
        if "file" in request.files:
            fs = request.files["file"]
            img = read_image_from_file_storage(fs)
            if img is None:
                return jsonify({"error": "Could not decode uploaded image"}), 400

        # 2) Or accept imageUrl
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
                return jsonify({"error": "Could not fetch/parse image URL"}), 400

        # 3) Simple restoration
        restored = restore_basic(img)

        # 4) Colorize (if grayscale or to enhance)
        try:
            colorized = colorize_opencv(restored)
        except Exception as e:
            # If colorization fails, fallback to restored image
            print("Colorize error:", e)
            colorized = restored

        datauri = bgr_to_datauri(colorized)
        return jsonify({"restored": datauri}), 200

    except requests.HTTPError as e:
        return jsonify({"error": f"Failed to fetch image URL: {str(e)}"}), 400
    except Exception as e:
        print("Server error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))