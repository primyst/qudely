from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client
import os
from dotenv import load_dotenv
import base64
import io
from PIL import Image

# Load environment variables
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")

if not HF_API_KEY or not HF_API_KEY.startswith("hf_"):
    raise ValueError("⚠️ Missing or invalid HF_API_KEY in .env")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# ✅ Use the full Hugging Face Space URL
MODEL_URL = "https://modelscope-old-photo-restoration.hf.space"
client = Client(MODEL_URL, hf_token=HF_API_KEY)


@app.route("/")
def home():
    return jsonify({"status": "✅ Qudely backend running!"})


@app.route("/restore", methods=["POST"])
def restore_image():
    try:
        # ✅ Handle uploaded file or image URL
        if "file" in request.files:
            image_file = request.files["file"]

            # Run model prediction
            result = client.predict(image_file, api_name="/predict")

        else:
            data = request.get_json()
            image_url = data.get("imageUrl")

            if not image_url:
                return jsonify({"error": "Missing image or URL"}), 400

            result = client.predict(image_url, api_name="/predict")

        # ✅ Handle output correctly (bytes or list)
        if isinstance(result, (list, tuple)):
            output = result[0]
        else:
            output = result

        # If output is bytes, encode to base64
        if isinstance(output, bytes):
            # Convert bytes to base64 string
            encoded = base64.b64encode(output).decode("utf-8")
            return jsonify({"restored": f"data:image/png;base64,{encoded}"})

        # If output is a PIL image
        if isinstance(output, Image.Image):
            buffer = io.BytesIO()
            output.save(buffer, format="PNG")
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            return jsonify({"restored": f"data:image/png;base64,{encoded}"})

        # If output is a string (URL)
        if isinstance(output, str):
            return jsonify({"restored": output})

        return jsonify({"error": "Unsupported model output type"}), 500

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)