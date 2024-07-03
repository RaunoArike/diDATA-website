import requests
from rest_framework.response import Response


# Verifies the user's API key by checking whether ANS accepts an API call using this key
# This is not the cleanest solution; I didn't find an explicit verification endpoint in ANS API docs, but perhaps there's another option for doing this in a more elegant way
def verify_api_key(key):
    header = {"accept": "application/json", "Authorization": f"Bearer {key}"}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/schools/2696/courses", headers=header, timeout=(10, 30))
        return response
    except requests.exceptions.RequestException as e:
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
    