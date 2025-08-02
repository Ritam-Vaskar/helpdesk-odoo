import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from chromadb.config import Settings

# Set persistent storage directory
client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_storage"
))

embedding_function = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

collection = client.get_or_create_collection(
    name="complaints",
    embedding_function=embedding_function
)

def add_complaint(complaint: str, complaint_id: str):
    collection.add(documents=[complaint], ids=[complaint_id])
    client.persist()

def search_complaints(query: str, k=5):
    results = collection.query(query_texts=[query], n_results=k)
    return results
