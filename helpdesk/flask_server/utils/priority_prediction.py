import requests
import google.generativeai as genai
from config.model import model

def get_priority_score(complaint_text):
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
        
        prompt = (
            "You are a helpdesk AI assistant. "
            "Given the following customer complaint, analyze its urgency and impact. "
            "Assign a PRIORITY SCORE from 1 (lowest) to 10 (highest) based on severity, urgency, and potential business impact. "
            "Respond ONLY with the number (1-10), no explanation. "
            f"Complaint:\n{complaint_text}"
        )        
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