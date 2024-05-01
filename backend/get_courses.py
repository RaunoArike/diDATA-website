import requests
import logging
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def get_course_list():
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/schools/2696/courses", headers=header)
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception()
    except:
        raise Exception()