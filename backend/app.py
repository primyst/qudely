# qudely_app.py
import os
from pathlib import Path
import requests
import warnings
warnings.filterwarnings("ignore")

import numpy as np
from PIL import Image
import cv2
import gradio as gr

# Try optional GFPGAN restore if installed
try:
    from gfpgan import GFPGANer
    GFPGAN_AVAILABLE = True
except Exception:
    GFPGAN_AVAILABLE = False

# -------------------------
# Config & model paths
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True, parents=True)

PROTO_PATH = MODEL_DIR / "colorization_deploy_v2.prototxt"
MODEL_PATH = MODEL_DIR / "colorization_release_v2.caffemodel"
PTS_PATH = MODEL_DIR / "pts_in_hull.npy"

# Verified (author) raw URLs — prefer author GitHub raw files (less redirection than Dropbox)
PROTO_URL = "https://github.com/richzhang/colorization/raw/master/models/colorization_deploy_v2.prototxt"
MODEL_URL = "https://github.com/richzhang/colorization/raw/master/models/colorization_release_v2.caffemodel"
PTS_URL   = "https://github.com/richzhang/colorization/raw/master/resources/pts_in_hull.npy"

# -------------------------
# Helper: robust download
# -------------------------
def download_file(url: str, out_path: Path, min_bytes: int = 1000):
    if out_path.exists() and out_path.stat().st_size > min_bytes:
        print(f"[ok] {out_path.name} already present ({out_path.stat().st_size} bytes)")
        return True
    print(f"[downloading] {out_path.name} from {url}")
    try:
        with requests.get(url, stream=True, timeout=120) as r:
            r.raise_for_status()
            tmp = out_path.with_suffix(".tmp")
            with open(tmp, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            tmp_size = tmp.stat().st_size
            if tmp_size < min_bytes:
                tmp.unlink(missing_ok=True)
                print(f"[fail] {out_path.name} seems too small ({tmp_size} bytes)")
                return False
            tmp.rename(out_path)
            print(f"[ok] downloaded {out_path.name} ({out_path.stat().st_size} bytes)")
            return True
    except Exception as e:
        print(f"[error] download failed for {out_path.name}: {e}")
        return False

def ensure_models():
    ok = True
    ok &= download_file(PROTO_URL, PROTO_PATH)
    ok &= download_file(MODEL_URL, MODEL_PATH, min_bytes=10_000_000)  # large model
    ok &= download_file(PTS_URL, PTS_PATH)
    # final sanity
    for p in (PROTO_PATH, MODEL_PATH, PTS_PATH):
        if not p.exists():
            raise FileNotFoundError(f"Missing model: {p}")
    return ok

# Try to download at startup (Spaces or local)
try:
    ensure_models()
except Exception as e:
    print("Model download / verification error:", e)

# -------------------------
# Optional GFPGAN wrapper (face restoration)
# -------------------------
gfpgan_restorer = None
if GFPGAN_AVAILABLE:
    try:
        # default pretrained weights downloaded by package when first called
        gfpgan_restorer = GFPGANer(model_path=None, upscale=1, arch="clean", channel_multiplier=2, bg_upsampler=None)
        print("[ok] GFPGAN available for face restoration")
    except Exception as e:
        print("[warn] GFPGAN import succeeded but init failed:", e)
        gfpgan_restorer = None

# -------------------------
# Image processing functions
# -------------------------
def restore_image_opencv(img_array: np.ndarray) -> np.ndarray:
    # normalize input shapes & convert to BGR for OpenCV processing
    if img_array is None:
        raise ValueError("No image supplied")
    if img_array.ndim == 2:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
    elif img_array.shape[2] == 4:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGR)
    else:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    denoised = cv2.fastNlMeansDenoisingColored(img_array, None, h=10, hColor=10, templateWindowSize=7, searchWindowSize=21)
    gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.dilate(edges, kernel, iterations=1)
    restored = cv2.inpaint(denoised, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    return restored

def colorize_opencv(img_bgr: np.ndarray) -> np.ndarray:
    # load net lazily to avoid repeated loading on every call
    global _cv_net, _pts_loaded
    if "_cv_net" not in globals():
        _cv_net = cv2.dnn.readNetFromCaffe(str(PROTO_PATH.resolve()), str(MODEL_PATH.resolve()))
        _pts_loaded = np.load(str(PTS_PATH.resolve()))
        # attach blobs
        class8 = _cv_net.getLayerId("class8_ab")
        conv8 = _cv_net.getLayerId("conv8_313_rh")
        pts = _pts_loaded.transpose().reshape(2, 313, 1, 1)
        _cv_net.getLayer(class8).blobs = [pts.astype(np.float32)]
        _cv_net.getLayer(conv8).blobs = [np.full((1, 313), 2.606, dtype=np.float32)]
        print("[ok] OpenCV colorization model loaded")

    h, w = img_bgr.shape[:2]
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    img_l = img_lab[:, :, 0]
    img_l_rs = cv2.resize(img_l, (224, 224))
    img_l_rs = img_l_rs - 50
    _cv_net.setInput(cv2.dnn.blobFromImage(img_l_rs))
    ab_dec = _cv_net.forward()[0, :, :, :].transpose((1, 2, 0))
    ab_dec_us = cv2.resize(ab_dec, (w, h))
    img_lab_out = np.concatenate((img_lab[:, :, 0][:, :, np.newaxis], ab_dec_us), axis=2)
    img_bgr_out = cv2.cvtColor(img_lab_out.astype(np.uint8), cv2.COLOR_LAB2BGR)
    return img_bgr_out

def enhance_colors(img_bgr: np.ndarray, saturation_boost: float = 1.3) -> np.ndarray:
    img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    img_hsv[:, :, 1] = np.clip(img_hsv[:, :, 1] * saturation_boost, 0, 255)
    return cv2.cvtColor(img_hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

def sharpen_image(img: np.ndarray) -> np.ndarray:
    kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]]) / 9
    return cv2.filter2D(img, -1, kernel)

def optional_gfpgan_restore(pil_img: Image.Image):
    if not gfpgan_restorer:
        return None
    try:
        img_np = np.array(pil_img.convert("RGB"))[:, :, ::-1]  # rgb->bgr
        cropped_faces, restored_faces, restored_img = gfpgan_restorer.enhance(img_np, has_aligned=False, only_center_face=False, paste_back=True)
        # restored_img is BGR numpy
        return restored_img
    except Exception as e:
        print("GFPGAN restore failed:", e)
        return None

def process_image(image: Image.Image, quality: str = "Balanced", use_gfpgan: bool = True) -> Image.Image:
    if image is None:
        return None

    try:
        quality_settings = {
            "Fast": {"saturation": 1.2, "sharpen": False},
            "Balanced": {"saturation": 1.3, "sharpen": True},
            "Best": {"saturation": 1.4, "sharpen": True},
        }
        s = quality_settings.get(quality, quality_settings["Balanced"])

        # Optional GFPGAN restore first (if available and user requested)
        if use_gfpgan and gfpgan_restorer:
            gfp_out = optional_gfpgan_restore(image)
            if gfp_out is not None:
                base_bgr = gfp_out
            else:
                base_bgr = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2BGR)
        else:
            img_arr = np.array(image.convert("RGB"))
            base_bgr = cv2.cvtColor(img_arr, cv2.COLOR_RGB2BGR)

        restored = restore_image_opencv(base_bgr)
        try:
            colorized = colorize_opencv(restored)
        except Exception as e:
            # if colorization fails, fallback to using the restored BGR directly
            print("Colorization failed, falling back to restored RGB:", e)
            colorized = restored

        enhanced = enhance_colors(colorized, s["saturation"])
        if s["sharpen"]:
            enhanced = sharpen_image(enhanced)

        result_rgb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB)
        result_rgb = np.clip(result_rgb, 0, 255).astype(np.uint8)
        return Image.fromarray(result_rgb)
    except Exception as e:
        print("Error processing image:", e)
        return None

# -------------------------
# Gradio UI
# -------------------------
with gr.Blocks(theme=gr.themes.Soft(), title="Qudely Photo Restoration") as demo:
    gr.Markdown("# 🎨 Qudely - Photo Restoration & Colorization")
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(label="Upload photo", type="pil", height=360)
            quality = gr.Radio(["Fast", "Balanced", "Best"], value="Balanced", label="Quality")
            use_gfpgan = gr.Checkbox(label="Use GFPGAN face restoration (if available)", value=GFPGAN_AVAILABLE)
            submit = gr.Button("Restore & Colorize")
            status = gr.Textbox(value="", visible=True, label="Status / Logs")
        with gr.Column():
            output_image = gr.Image(label="Result", type="pil", height=360)

    def wrapped_process(img, qual, gfp_opt):
        if img is None:
            return None, "Please upload an image."
        status_msgs = []
        try:
            status_msgs.append("Starting processing...")
            pil_result = process_image(img, qual, use_gfpgan=bool(gfp_opt))
            if pil_result:
                status_msgs.append("✅ Done")
                return pil_result, "\n".join(status_msgs)
            else:
                status_msgs.append("❌ Failed to produce result.")
                return None, "\n".join(status_msgs)
        except Exception as e:
            status_msgs.append(f"❌ Exception: {e}")
            return None, "\n".join(status_msgs)

    submit.click(wrapped_process, inputs=[input_image, quality, use_gfpgan], outputs=[output_image, status])

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, show_error=True)