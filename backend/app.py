from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import requests
import io
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

HF_API_URL = "https://api-inference.huggingface.co/models/caidas/sdxl-inpainting"
HF_API_KEY = os.getenv("HF_API_KEY")  # make sure this is set

@app.route("/restore", methods=["POST"])
def restore_image():
    try:
        file = request.files["image"]
        image_bytes = file.read()

        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
        }

        response = requests.post(
            HF_API_URL,
            headers=headers,
            files={"file": ("image.png", image_bytes, "image/png")},
        )

        if response.status_code != 200:
            return jsonify({"error": f"Failed: {response.text}"}), response.status_code

        # Convert response content to base64 before returning
        restored_base64 = base64.b64encode(response.content).decode("utf-8")

        return jsonify({"image": restored_base64})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)