import requests
import logging
from rest_framework.response import Response

logger = logging.getLogger(__name__)


# Queries a list of assignments corresponding to course_code from ANS
def get_assignment_list(course_code, api_key):
    header = {"accept": "application/json", "Authorization": f"Bearer {api_key}"}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/courses/{course_code}/assignments", headers=header)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception()

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)