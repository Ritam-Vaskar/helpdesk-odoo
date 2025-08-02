import requests
import json

with open('test_request.json') as f:
    payload = json.load(f)

response = requests.post('http://localhost:8080/summarize', json=payload)
print(response.status_code)
print(response.json())
