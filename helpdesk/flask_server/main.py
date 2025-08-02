from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.summary import summarize_text
from utils.priority_prediction import get_priority_score
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/summarize', methods=['POST'])
def summarize_plain():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text in request'}), 400

    text = data['text']

    if len(text.strip()) == 0:
        return jsonify({'error': 'Empty text provided'}), 400

    try:
        summary = summarize_text(text)
        return jsonify({'summary': summary}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to summarize text: {str(e)}'}), 500

@app.route('/priority_score', methods=['POST'])
def priority_score():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text in request'}), 400

    text = data['text']

    if len(text.strip()) == 0:
        return jsonify({'error': 'Empty text provided'}), 400

    try:
        score = get_priority_score(text)
        return jsonify({'priority_score': score}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get priority score: {str(e)}'}), 500

    if len(text.strip()) == 0:
        return jsonify({'error': 'Empty text provided'}), 400

    try:
        summary = summarize_text(text)
        return jsonify({'summary': summary}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to summarize text: {str(e)}'}), 500
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
    