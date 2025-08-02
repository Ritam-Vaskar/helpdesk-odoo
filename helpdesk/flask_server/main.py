from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.summary import summarize_text
from utils.priority_user import get_priority_users, format_priority_report
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


@app.route('/priority-users', methods=['POST'])
def get_priority_users_endpoint():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Missing JSON data in request'}), 400
        
        if 'question' not in data:
            return jsonify({'error': 'Missing question in request'}), 400
            
        if 'users' not in data:
            return jsonify({'error': 'Missing users data in request'}), 400
        
        question = data['question']
        users = data['users']
        top_n = data.get('top_n', None)
        
        if not question.strip():
            return jsonify({'error': 'Question cannot be empty'}), 400
            
        if not isinstance(users, list) or len(users) == 0:
            return jsonify({'error': 'Users must be a non-empty list'}), 400
        
        # Get priority users
        result = get_priority_users(users, question, top_n)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to analyze priority users: {str(e)}'}), 500



if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)