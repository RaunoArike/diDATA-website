import requests
import logging
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def get_assignment_list(course_code, api_key):
    """
    Retrieves a list of assignments corresponding to course_code from ANS.
    
    Args:
        course_code (str): The course code.
        api_key (str): The API key for authentication.
    
    Returns:
        list: A list of assignments if the request is successful.
    
    Raises:
        requests.exceptions.RequestException: If the request fails.
        requests.exceptions.HTTPError: If the response contains an unsuccessful status code.
    """
    header = {"accept": "application/json", "Authorization": f"Bearer {api_key}"}
    try:
        response = requests.get(f"https://edu.ans.app/api/v2/courses/{course_code}/assignments", headers=header)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        raise
    