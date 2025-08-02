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

def summarize_text(content):
    print("Starting summarization...")
    print(f"API Key present: {bool(os.environ.get('GEMINI_API_KEY'))}")
    print(f"API Key (first 10 chars): {os.environ.get('GEMINI_API_KEY', '')[:10]}...")
    
    try:
        # List available models for debugging
        print("Listing available models...")
        try:
            models = genai.list_models()
            available_models = [m.name for m in models]
            print(f"Available models: {available_models[:5]}...")  # Show first 5
        except Exception as model_list_error:
            print(f"Could not list models: {model_list_error}")
        
        # Test if the model is accessible with a simple prompt first
        print("Testing model access...")
        test_result = model.generate_content("Say hello")
        print("Model access test successful")
        
        prompt = f"You are a professional complaint summarizer. Given the complaint text\
              below, extract and summarize the main issues raised, impacted areas or\
                individuals, and any actions requested or taken. Use formal and objective\
                      language. Avoid exaggeration or personal interpretation. If applicable,\
                          categorize the type of complaint (e.g., technical issue, service\
                              delay, product defect). Structure the summary in bullet points\
                                  for clarity.\
            Length: Keep it concise while retaining essential details (about 25–30% of the original).\
                  Complaint text:\n\n{content}"
        
        print("Generating content with Gemini...")
        result = model.generate_content(prompt)
        print("Content generated successfully")
        
        return result.text
        
    except Exception as e:
        print(f"Error in summarize_text: {str(e)}")
        print(f"Error type: {type(e)}")
        
        # Check if it's an API key issue
        if "403" in str(e) or "API_KEY" in str(e):
            raise Exception("Invalid API key or API access issue. Please check your GEMINI_API_KEY.")
        elif "SERVICE_DISABLED" in str(e):
            raise Exception("Generative Language API is disabled. Please enable it in Google Cloud Console or get a direct API key from Google AI Studio.")
        elif "404" in str(e) and "models/" in str(e):
            raise Exception("Model not found. The Gemini model name may be incorrect or unavailable.")
        else:
            raise e