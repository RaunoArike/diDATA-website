import requests
import logging
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def get_assignment_list(course_code):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/courses/{course_code}/assignments", headers=header)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception()

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)