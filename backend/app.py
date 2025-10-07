from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

HF_API_URL = "https://modelscope-old-photo-restoration.hf.space/api/predict"
# (optional) if you want to use your HuggingFace token later:
HF_TOKEN = os.getenv("HF_TOKEN")

@app.route("/restore", methods=["POST"])
def restore_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        # Send to ModelScope API
        files = {"file": (file.filename, file.stream, file.mimetype)}
        response = requests.post(HF_API_URL, files=files)

        # Handle non-200 responses
        if response.status_code != 200:
            return jsonify({"error": f"Model API failed with {response.status_code}"}), 500

        data = response.json()

        # Check ModelScope format (they often return base64 inside data)
        # Try to get the image bytes safely
        if "data" in data:
            restored_bytes = base64.b64decode(data["data"][0]) if isinstance(data["data"][0], str) else data["data"][0]
        else:
            restored_bytes = response.content  # fallback

        # Encode result as base64 string for frontend
        restored_base64 = base64.b64encode(restored_bytes).decode("utf-8")

        return jsonify({"image": f"data:image/png;base64,{restored_base64}"})
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)