from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")

if not HF_API_KEY or not HF_API_KEY.startswith("hf_"):
    raise ValueError("⚠️ Missing or invalid HF_API_KEY in .env")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# ✅ Use full Hugging Face Space URL (not just model ID)
MODEL_URL = "https://modelscope-old-photo-restoration.hf.space"
client = Client(MODEL_URL, hf_token=HF_API_KEY)

@app.route("/")
def home():
    return jsonify({"status": "✅ Qudely backend running!"})

@app.route("/restore", methods=["POST"])
def restore_image():
    try:
        # ✅ Handle both file uploads and direct image URLs
        if "file" in request.files:
            image_file = request.files["file"]
            result = client.predict(image_file, api_name="/predict")
        else:
            data = request.get_json()
            image_url = data.get("imageUrl")
            if not image_url:
                return jsonify({"error": "Missing image or URL"}), 400
            result = client.predict(image_url, api_name="/predict")

        # ✅ Ensure model returns a valid response
        if isinstance(result, (list, tuple)) and len(result) > 0:
            restored_image_url = result[0]
        elif isinstance(result, str):
            restored_image_url = result
        else:
            return jsonify({"error": "Invalid model response"}), 500

        return jsonify({"restored": restored_image_url})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)