import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
from flask_cors import CORS
from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Configure Gemini AI
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)



bone_model_path = os.path.join("models", "bone_model.h5")
bone_labels_path = os.path.join("labels", "bone_labels.txt")
cataract_model_path = os.path.join("models", "cataract_model.h5")
cataract_labels_path = os.path.join("labels", "cataract_labels.txt")
lung_model_path = os.path.join("models", "lung_model.h5")
lung_labels_path = os.path.join("labels", "lung_labels.txt")
skin_model_path = os.path.join("models", "skin_model.h5")
skin_labels_path = os.path.join("labels", "skin_labels.txt")

# Store conversation history
conversation_history = []

@app.route("/chat", methods=["POST"])
def chat():
    """Handles chatbot responses using Gemini AI"""
    global conversation_history

    data = request.json
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    conversation_history.append({"role": "user", "parts": [{"text": user_message}]})

    formatted_history = [{"role": item["role"], "parts": item["parts"]} for item in conversation_history]

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(formatted_history)

        bot_response = response.text.strip() if hasattr(response, 'text') and response.text else "No response from Gemini AI."

        conversation_history.append({"role": "assistant", "parts": [{"text": bot_response}]})

        return jsonify({"response": bot_response})

    except Exception as e:
        return jsonify({"error": "Failed to generate a response."}), 500


@app.route("/reset", methods=["POST"])
def reset():
    """Resets conversation history"""
    global conversation_history
    conversation_history = []
    return jsonify({"message": "Conversation history cleared."})


def process_image(image_file, model_path, labels_path):
    """Loads an image, preprocesses it, and makes a prediction"""
    try:
        model = load_model(model_path, compile=False)
        class_names = open(labels_path, "r").readlines()

        # Preprocess image
        image = Image.open(image_file).convert("RGB")
        image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
        image_array = np.asarray(image)

        # Normalize image
        normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
        data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
        data[0] = normalized_image_array

        # Predict
        prediction = model.predict(data)
        index = np.argmax(prediction)
        class_name = class_names[index].strip()
        confidence_score = float(prediction[0][index])

        return {"class": class_name, "confidence": confidence_score}

    except Exception as e:
        return {"error": str(e)}


@app.route("/predict/cataract", methods=["POST"])
def predict_cataract():
    """Handles cataract disease detection"""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    result = process_image(request.files["image"], cataract_model_path, cataract_labels_path)
    return jsonify(result)


@app.route("/predict/lung", methods=["POST"])
def predict_lung():
    """Handles lung disease detection"""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    result = process_image(request.files["image"], lung_model_path, lung_labels_path)
    return jsonify(result)


@app.route("/predict/skin", methods=["POST"])
def predict_skin():
    """Handles skin disease detection"""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    result = process_image(request.files["image"], skin_model_path, skin_labels_path)
    return jsonify(result)


@app.route("/predict/bone", methods=["POST"])
def predict_bone():
    """Handles bone disease detection"""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    result = process_image(request.files["image"], bone_model_path, bone_labels_path)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

