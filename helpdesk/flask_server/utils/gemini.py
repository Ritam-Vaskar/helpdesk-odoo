import google.generativeai as genai
import os
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

def summarize_text(content):
    print("I am here to test")
    print(os.environ.get("GEMINI_API_KEY"))
    prompt = f"You are a professional complaint summarizer. Given the complaint text below, extract and summarize the main issues raised, impacted areas or individuals, and any actions requested or taken. Use formal and objective language. Avoid exaggeration or personal interpretation. If applicable, categorize the type of complaint (e.g., technical issue, service delay, product defect). Structure the summary in bullet points for clarity. Length: Keep it concise while retaining essential details (about 25–30% of the original). Complaint text:\n\n{content}"
    result = model.generate_content(prompt)

    return result.text