import requests
import logging
from rest_framework.response import Response

logger = logging.getLogger(__name__)


# Queries a list of courses from ANS
# Currently uses a hardcoded value for the school, which should be changed if the app is ever extended to also be used outside of TU Delft
# Returns the list of courses that the user can access in ANS using their API key
def get_course_list(api_key):
    header = {"accept": "application/json", "Authorization": f"Bearer {api_key}"}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/schools/2696/courses", headers=header, timeout=(10, 30))
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
    