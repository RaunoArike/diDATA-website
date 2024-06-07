import requests
from rest_framework.response import Response


def verify_api_key(key):
    header = {"accept": "application/json", "Authorization": f"Bearer {key}"}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/schools/2696/courses", headers=header)
        return response
    except requests.exceptions.RequestException as e:
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
    