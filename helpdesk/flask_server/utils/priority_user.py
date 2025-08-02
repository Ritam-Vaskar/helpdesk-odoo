
import google.generativeai as genai
from config.model import model
import json
import re

def simple_analyze_user(user_id, solved_queries, question):
    """
    Simplified analysis that doesn't rely on JSON parsing
    """
    try:
        print(f"Starting simple analysis for {user_id}")
        print(f"Question: {question}")
        print(f"User has {len(solved_queries)} solved queries")
        
        prompt = f"""
        Rate how relevant this user is for the question on a scale of 0-10.
        
        Question: "{question}"
        
        User's solved queries:
        {chr(10).join([f"- {query}" for query in solved_queries])}
        
        Give me just a number from 0-10 where:
        - 10 = extremely relevant
        - 5 = moderately relevant  
        - 0 = not relevant
        
        Just respond with the number only.
        """
        
        print(f"Sending prompt to model...")
        response = model.generate_content(prompt)
        score_text = response.text.strip()
        print(f"Model response: '{score_text}'")
        
        # Extract number from response
        score_match = re.search(r'(\d+)', score_text)
        score = int(score_match.group(1)) if score_match else 0
        score = min(10, max(0, score))  # Ensure score is between 0-10
        
        print(f"Extracted score: {score}")
        
        # Generate simple reasoning based on score
        if score >= 8:
            reasoning = f"High relevance - user has strong expertise in this domain"
        elif score >= 5:
            reasoning = f"Moderate relevance - user has some related experience"
        elif score >= 2:
            reasoning = f"Low relevance - user has limited related experience"
        else:
            reasoning = f"No relevance - user's expertise is in different domains"
        
        # Find matching queries by simple keyword matching
        question_keywords = set(question.lower().split())
        matching_queries = []
        
        for query in solved_queries:
            query_keywords = set(query.lower().split())
            if len(question_keywords.intersection(query_keywords)) >= 2:
                matching_queries.append(query)
        
        print(f"Found {len(matching_queries)} matching queries")
        
        result = {
            "userId": user_id,
            "relevance_score": score,
            "reasoning": reasoning,
            "matching_queries": matching_queries[:3],  # Limit to top 3
            "total_solved_queries": len(solved_queries)
        }
        
        print(f"Final result for {user_id}: {result}")
        return result
        
    except Exception as e:
        print(f"Simple analysis failed for {user_id}: {e}")
        import traceback
        traceback.print_exc()
        return {
            "userId": user_id,
            "relevance_score": 0,
            "reasoning": f"Analysis failed: {str(e)}",
            "matching_queries": [],
            "total_solved_queries": len(solved_queries)
        }

def analyze_user_expertise(users_data, question):
    """
    Analyze users and rate them based on their relevance to the given question.
    Uses a robust approach with fallback to simple analysis.
    """
    try:
        results = []
        
        for user in users_data:
            user_id = user.get("userId", "Unknown")
            solved_queries = user.get("Solved queries", [])
            
            print(f"Analyzing user {user_id}...")
            
            # Use simple analysis by default - it's more reliable
            user_result = simple_analyze_user(user_id, solved_queries, question)
            results.append(user_result)
        
        # Sort users by relevance score (highest first)
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return results
        
    except Exception as e:
        print(f"Error in analyze_user_expertise: {str(e)}")
        raise e

def get_priority_users(users_data, question, top_n=None):
    """
    Get priority users for a given question.
    
    Args:
        users_data: List of user objects
        question: The question to match
        top_n: Number of top users to return (None for all)
    
    Returns:
        List of top users with their relevance analysis
    """
    try:
        analyzed_users = analyze_user_expertise(users_data, question)
        
        if top_n:
            analyzed_users = analyzed_users[:top_n]
        
        return {
            "question": question,
            "total_users_analyzed": len(users_data),
            "priority_users": analyzed_users,
            "summary": {
                "highest_score": analyzed_users[0]["relevance_score"] if analyzed_users else 0,
                "most_relevant_user": analyzed_users[0]["userId"] if analyzed_users else None
            }
        }
        
    except Exception as e:
        print(f"Error in get_priority_users: {str(e)}")
        raise e

def format_priority_report(priority_result):
    """
    Format the priority result into a readable report.
    """
    try:
        report = f"\nPRIORITY USER ANALYSIS\n"
        report += f"=" * 50 + "\n"
        report += f"Question: {priority_result['question']}\n"
        report += f"Users Analyzed: {priority_result['total_users_analyzed']}\n"
        report += f"Most Relevant User: {priority_result['summary']['most_relevant_user']}\n"
        report += f"Highest Score: {priority_result['summary']['highest_score']}/10\n\n"
        
        report += "RANKED USERS:\n"
        report += "-" * 30 + "\n"
        
        for i, user in enumerate(priority_result['priority_users'], 1):
            report += f"{i}. User ID: {user['userId']}\n"
            report += f"   Score: {user['relevance_score']}/10\n"
            report += f"   Total Queries Solved: {user['total_solved_queries']}\n"
            report += f"   Reasoning: {user['reasoning']}\n"
            if user['matching_queries']:
                report += f"   Relevant Queries: {', '.join(user['matching_queries'][:3])}...\n"
            report += "\n"
        
        return report
        
    except Exception as e:
        print(f"Error formatting report: {str(e)}")
        return "Error generating report"

# Example usage function
def example_usage():
    """
    Example of how to use the priority user system
    """
    sample_users = [
        {
            "userId": "23CS8002",
            "Solved queries": [
                "How to integrate Gemini API with Flask?",
                "How to summarize text using Gemini API?",
                "How to handle errors in Gemini API integration?"
            ]
        },
        {
            "userId": "23CS8003",
            "Solved queries": [
                "How to solve laptop problem?",
                "how laptop gpu works?",
                "How to fix laptop screen issue?",
                "How to troubleshoot laptop battery problems?",
                "How to clean laptop keyboard?",
                "How to upgrade laptop RAM?",
                "How to install software on laptop?"
            ]
        },
        {
            "userId": "23CS8004",
            "Solved queries": [
                "how to cook pasta?",
                "how to make pizza?",
                "how to bake a cake?",
                "how to prepare salad?"
            ]
        }
    ]
    
    question = "How to fix GPU driver issues on Windows laptop?"
    
    result = get_priority_users(sample_users, question, top_n=3)
    report = format_priority_report(result)
    
    print(report)
    return result
