from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import os

app = Flask(__name__)
CORS(app)

MODEL_URL = "https://modelscope-old-photo-restoration.hf.space/api/predict"

@app.route("/restore", methods=["POST"])
def restore_photo():
    try:
        # Get uploaded image
        image = request.files["image"]
        if not image:
            return jsonify({"error": "No image uploaded"}), 400

        # Send image to Hugging Face ModelScope API
        files = {"image": (image.filename, image.stream, image.mimetype)}
        response = requests.post(MODEL_URL, files=files)

        # Check model response
        if response.status_code != 200:
            return jsonify({"error": "Model API failed", "details": response.text}), 500

        result = response.json()

        # If result includes an image (in bytes), encode it safely to base64
        if "data" in result:
            output_image = result["data"][0]["image"]
            if isinstance(output_image, bytes):
                output_image = base64.b64encode(output_image).decode("utf-8")

            return jsonify({"image": output_image}), 200

        return jsonify({"error": "Unexpected response structure", "raw": result}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))