import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Set persistent storage directory - Updated for new ChromaDB API
client = chromadb.PersistentClient(path="./chroma_storage")

embedding_function = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

collection = client.get_or_create_collection(
    name="complaints",
    embedding_function=embedding_function
)

def add_complaint(complaint: str, complaint_id: str, metadata=None):
    """
    Add a complaint to the vector database with optional metadata.
    """
    if metadata is None or len(metadata) == 0:
        # ChromaDB requires non-empty metadata, so we provide a default
        metadata = {"type": "complaint"}
    
    collection.add(
        documents=[complaint], 
        ids=[complaint_id],
        metadatas=[metadata]
    )
    # No need to call client.persist() with PersistentClient

def search_complaints(query: str, k=5):
    """
    Search for semantically similar complaints using vector similarity.
    Returns only complaints that are meaningfully related to the query.
    """
    results = collection.query(
        query_texts=[query], 
        n_results=k,
        # Add metadata filtering if needed
        # where={"category": "specific_category"}  # Optional filtering
    )
    
    # Filter results by similarity threshold to avoid unrelated matches
    if results['distances'] and len(results['distances'][0]) > 0:
        # ChromaDB uses distance (lower = more similar)
        # Filter out results with distance > 0.8 (adjust threshold as needed)
        similarity_threshold = 0.8
        
        filtered_documents = []
        filtered_ids = []
        filtered_distances = []
        
        for i, distance in enumerate(results['distances'][0]):
            if distance <= similarity_threshold:
                filtered_documents.append(results['documents'][0][i])
                filtered_ids.append(results['ids'][0][i])
                filtered_distances.append(distance)
        
    return {
        'documents': [filtered_documents],
        'ids': [filtered_ids],
        'distances': [filtered_distances]
    }

def search_similar_complaints(query: str, k=5, threshold=0.8):
    """
    Search for semantically similar complaints with detailed similarity information.
    Returns complaints with similarity scores and better formatting.
    """
    results = collection.query(
        query_texts=[query], 
        n_results=k
    )
    
    similar_complaints = []
    
    if results['distances'] and len(results['distances'][0]) > 0:
        # Debug: Print all results to see what we're getting
        print(f"Search query: {query}")
        print(f"Found {len(results['distances'][0])} results")
        
        for i, distance in enumerate(results['distances'][0]):
            # Convert distance to similarity score (1 - distance for better UX)
            similarity_score = max(0, 1 - distance)
            
            print(f"Result {i+1}: distance={distance:.3f}, similarity={similarity_score:.3f}")
            print(f"Text: {results['documents'][0][i][:100]}...")
            
            # Use a more lenient threshold - 1.2 instead of 0.8
            # ChromaDB distance can be > 1.0 for very different content
            if distance <= 1.2:  # More lenient threshold
                similar_complaints.append({
                    'id': results['ids'][0][i],
                    'complaint': results['documents'][0][i],
                    'similarity_score': round(similarity_score, 3),
                    'distance': round(distance, 3)
                })
    
    # Sort by similarity score (highest first)
    similar_complaints.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    return {
        'query': query,
        'total_found': len(similar_complaints),
        'similar_complaints': similar_complaints
    }

def get_all_complaints():
    """
    Get all complaints in the database for debugging purposes.
    """
    try:
        # Get all documents from the collection
        results = collection.get()
        return {
            'total_complaints': len(results['ids']),
            'complaints': [
                {
                    'id': results['ids'][i],
                    'text': results['documents'][i],
                    'metadata': results['metadatas'][i] if results['metadatas'] else {}
                }
                for i in range(len(results['ids']))
            ]
        }
    except Exception as e:
        return {'error': str(e)}

def enhanced_search_complaints(query: str, k=5):
    """
    Enhanced search that tries multiple query variations to find relevant complaints.
    """
    # Try the original query
    original_results = search_similar_complaints(query, k, threshold=1.5)
    
    # Also try expanding common terms
    expanded_queries = []
    query_lower = query.lower()
    
    # Common synonyms for appliances/products
    synonyms = {
        'fridge': 'refrigerator freezer cooling appliance',
        'refrigerator': 'fridge freezer cooling appliance',
        'washing machine': 'washer laundry machine',
        'washer': 'washing machine laundry',
        'tv': 'television screen display',
        'television': 'tv screen display',
        'phone': 'mobile smartphone device',
        'laptop': 'computer notebook',
        'issue': 'problem defect broken damaged faulty',
        'problem': 'issue defect broken damaged faulty',
        'broken': 'damaged defective faulty not working',
        'damaged': 'broken defective faulty dented',
        'delivery': 'shipping delivered received',
        'refund': 'return money back replacement',
    }
    
    # Add expanded terms to the query
    for word, expansion in synonyms.items():
        if word in query_lower:
            expanded_queries.append(f"{query} {expansion}")
    
    # Combine results from all queries
    all_complaints = {}
    
    # Add original results
    for complaint in original_results['similar_complaints']:
        all_complaints[complaint['id']] = complaint
    
    # Add results from expanded queries
    for expanded_query in expanded_queries:
        expanded_results = search_similar_complaints(expanded_query, k, threshold=1.5)
        for complaint in expanded_results['similar_complaints']:
            if complaint['id'] not in all_complaints:
                all_complaints[complaint['id']] = complaint
    
    # Convert back to list and sort by similarity
    final_complaints = list(all_complaints.values())
    final_complaints.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    return {
        'query': query,
        'expanded_searches': len(expanded_queries),
        'total_found': len(final_complaints),
        'similar_complaints': final_complaints[:k]
    }
