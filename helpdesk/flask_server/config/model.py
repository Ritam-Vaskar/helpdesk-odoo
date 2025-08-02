import google.generativeai as genai
import os
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

# Configure the API key directly (this bypasses Google Cloud project requirements)
genai.configure(api_key=api_key)

# Use the correct model names for the current Gemini API
model = None
model_names = [
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-pro",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro"
]

for model_name in model_names:
    try:
        model = genai.GenerativeModel(model_name)
        print(f"Successfully initialized model: {model_name}")
        break
    except Exception as e:
        print(f"Failed to initialize {model_name}: {e}")
        continue

if model is None:
    raise ValueError("Could not initialize any Gemini model")

