from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import requests

app = Flask(__name__)
CORS(app)

HF_API_KEY = os.getenv("HF_API_KEY")
HF_API_URL = "https://api-inference.huggingface.co/models/caidas/sdxl-inpainting"  # example HF model

if not HF_API_KEY:
    raise ValueError("⚠️ HF_API_KEY missing in environment variables")

@app.route("/")
def home():
    return jsonify({"status": "✅ Qudely backend running!"})

@app.route("/restore", methods=["POST"])
def restore_image():
    try:
        # Must match frontend key
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        image_bytes = file.read()

        headers = {"Authorization": f"Bearer {HF_API_KEY}"}

        response = requests.post(
            HF_API_URL,
            headers=headers,
            files={"file": ("image.png", image_bytes, "image/png")},
        )

        if response.status_code != 200:
            return jsonify({"error": response.text}), response.status_code

        # Convert response to base64 to send to frontend
        restored_base64 = base64.b64encode(response.content).decode("utf-8")
        return jsonify({"restored": f"data:image/png;base64,{restored_base64}"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)