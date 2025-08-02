# chat_bot.py
import requests
import google.generativeai as genai
from config.model import model
import os
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Prompt template for domain-specific chatbot (complaint resolution)
CHATBOT_PROMPT = """
You are a domain-specific assistant that helps administrators respond to user complaints in a clear and helpful way.

Your job is to:
- Internally analyze the complaint to understand the issue and possible causes.
- Use that understanding to craft a respectful, accurate, and helpful message that can be sent directly to the user.

Guidelines:
- Do NOT include section titles like "Complaint Summary", "Possible Causes", or "Suggested Response".
- Do NOT explain your reasoning or describe what you're doing.
- Your final output should be a single, natural, and concise message that directly addresses the complaint.
- If the input is not a user complaint or is off-topic, respond with:
  "I'm only able to help with user complaints. Please rephrase your message as a complaint."

Always respond professionally and within the domain of complaint assistance.

User complaint:
"""





def resolve_complaint_query(user_query):
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
        #test_result = model.generate_content("Say hello")
        #print("Model access test successful")
        
        prompt = (
            CHATBOT_PROMPT+
            f"\n{user_query}"
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
