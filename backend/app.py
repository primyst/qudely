from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client
import os
import io
import base64
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY or not HF_API_KEY.startswith("hf_"):
    raise ValueError("⚠️ Missing or invalid HF_API_KEY in .env")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Gradio client (Hugging Face Space)
MODEL_URL = "https://modelscope-old-photo-restoration.hf.space"
client = Client(MODEL_URL, hf_token=HF_API_KEY)


@app.route("/")
def home():
    return jsonify({"status": "✅ Qudely backend running!"})


@app.route("/restore", methods=["POST"])
def restore_image():
    try:
        # If the user uploads a file
        if "file" in request.files:
            image_file = request.files["file"]
            image_bytes = image_file.read()
            result = client.predict(image_bytes, api_name="/predict")

        # If the user sends a URL
        else:
            data = request.get_json()
            image_url = data.get("imageUrl")

            if not image_url:
                return jsonify({"error": "Missing image or URL"}), 400

            result = client.predict(image_url, api_name="/predict")

        # The model may return different formats
        restored_image = None

        # If it's an image (PIL Image or bytes)
        if isinstance(result, bytes):
            restored_image = base64.b64encode(result).decode("utf-8")
        elif isinstance(result, str) and result.startswith("data:image"):
            # Already base64 encoded
            restored_image = result.split(",")[1]
        elif isinstance(result, (list, tuple)) and len(result) > 0:
            # If it returns a list, convert the first item
            first_item = result[0]
            if isinstance(first_item, bytes):
                restored_image = base64.b64encode(first_item).decode("utf-8")
            elif isinstance(first_item, Image.Image):
                buf = io.BytesIO()
                first_item.save(buf, format="PNG")
                restored_image = base64.b64encode(buf.getvalue()).decode("utf-8")

        if not restored_image:
            return jsonify({"error": "Invalid model output"}), 500

        # Return base64 image to frontend
        return jsonify({"restored": f"data:image/png;base64,{restored_image}"})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)