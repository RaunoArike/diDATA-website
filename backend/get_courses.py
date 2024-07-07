import requests
import logging
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def get_course_list(api_key):
    """
    Queries a list of courses from ANS.
    Currently uses a hardcoded value for the school, which should be changed if the app is ever extended to also be used outside of TU Delft.
    
    Args:
        api_key (str): The API key for authentication.
    
    Returns:
        list: A list of courses that the user can access in ANS using their API key.
    
    Raises:
        requests.exceptions.RequestException: If the request fails.
        requests.exceptions.HTTPError: If the response contains an unsuccessful status code.
    """
    header = {"accept": "application/json", "Authorization": f"Bearer {api_key}"}
    try:
        response = requests.get("https://edu.ans.app/api/v2/schools/2696/courses", headers=header, timeout=(10, 30))
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        raise
    