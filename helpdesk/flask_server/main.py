from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.summary import summarize_text
from utils.priority_prediction import get_priority_score
from utils.priority_user import get_priority_users, format_priority_report
from utils.store import add_complaint, search_complaints, search_similar_complaints, get_all_complaints, enhanced_search_complaints
from utils.chat_bot import resolve_complaint_query
import os
from dotenv import load_dotenv
import uuid

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

@app.route('/priority-users', methods=['POST'])
def get_priority_users_endpoint():
    print("Received request to get priority users")
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

@app.route('/add_complaint', methods=['POST'])
def add():
    data = request.get_json()
    complaint = data.get('text', '').strip()
    
    if not complaint:
        return jsonify({'error': 'Complaint text is required'}), 400
    
    complaint_id = str(uuid.uuid4())
    
    # Optional metadata for better categorization
    metadata = {
        'timestamp': data.get('timestamp'),
        'category': data.get('category'),
        'priority': data.get('priority'),
        'user_id': data.get('user_id')
    }
    
    # Remove None values from metadata
    metadata = {k: v for k, v in metadata.items() if v is not None}
    
    # Ensure we have at least one metadata field for ChromaDB
    if not metadata:
        metadata = {'type': 'complaint'}
    
    try:
        add_complaint(complaint, complaint_id, metadata)
        return jsonify({
            'message': 'Complaint added successfully', 
            'id': complaint_id,
            'metadata': metadata
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# @app.route('/search_complaints', methods=['POST'])
# def search():
#     data = request.get_json()
#     query = data.get('query', '').strip()
    
#     if not query:
#         return jsonify({'error': 'Search query is required'}), 400
    
#     try:
#         results = search_complaints(query, k=5)
#         return jsonify({
#             'matches': results['documents'][0],
#             'ids': results['ids'][0],
#             'distances': results['distances'][0]
#         }), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/search_similar_complaints', methods=['POST'])
def search_similar():
    data = request.get_json()
    query = data.get('query', '').strip()
    max_results = data.get('max_results', 5)
    similarity_threshold = data.get('similarity_threshold', 1.2)  # More lenient default
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    try:
        results = search_similar_complaints(
            query=query, 
            k=max_results, 
            threshold=similarity_threshold
        )
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enhanced_search_complaints', methods=['POST'])
def enhanced_search():
    data = request.get_json()
    query = data.get('query', '').strip()
    max_results = data.get('max_results', 5)
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    try:
        results = enhanced_search_complaints(query=query, k=max_results)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/all_complaints', methods=['GET'])
def get_all():
    """Get all complaints for debugging purposes."""
    try:
        results = get_all_complaints()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/resolve_complaint', methods=['POST'])
def resolve_complaint():
    data = request.get_json()
    user_query = data.get('query', '').strip()
    
    if not user_query:
        return jsonify({'error': 'User query is required'}), 400
    
    try:
        response = resolve_complaint_query(user_query)
        return jsonify({'response': response}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
    