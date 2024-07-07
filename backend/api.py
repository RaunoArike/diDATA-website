import requests
import logging
from .get_assignments import get_assignment_list
from .get_charts import get_assignment_results, get_single_assignment_data, find_assignment
from .get_courses import get_course_list
from .get_test_data import load_test_data
from .verify import verify_api_key
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


logger = logging.getLogger(__name__)

def extract_key_from_header(auth_header):
    parts = auth_header.split()
    if len(parts) == 2 and parts[0] == 'Bearer':
        return parts[1]
    return None

@api_view(['GET'])
def chart_view(request, course_code, assignment_id, **kwargs):
    """
    Retrieves and returns chart data for a specific assignment within a course.
    """
    update = kwargs.get('update', False)
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_400_BAD_REQUEST)

    key = extract_key_from_header(auth_header)
    if not key:
        return Response({"error": "Authorization header must be Bearer token."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        assignments = get_assignment_list(course_code, key)
        assignment = find_assignment(assignments, assignment_id)
        result_ids, grades, last_updated = get_assignment_results(course_code, assignment["id"], key, update)
        results_by_question, results_by_exercise = get_single_assignment_data(course_code, assignment["id"], result_ids, key, update)
        response = Response({
            "results_by_question": results_by_question,
            "results_by_exercise": results_by_exercise,
            "grades": grades,
            "assignment_name": assignment["name"],
            "last_updated": last_updated
        })
        return response
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except KeyError as e:
        logger.error(f"Key error: {e}")
        return Response({'error': 'Invalid assignment or course code.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def assignments_view(request, course_code):
    """
    Retrieves and returns a list of assignments for a specific course.
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_400_BAD_REQUEST)

    key = extract_key_from_header(auth_header)
    if not key:
        return Response({"error": "Authorization header must be Bearer token."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        return Response(get_assignment_list(course_code, key))
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def courses_view(request):
    """
    Retrieves and returns a list of courses.
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_400_BAD_REQUEST)

    key = extract_key_from_header(auth_header)
    if not key:
        return Response({"error": "Authorization header must be Bearer token."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        return Response(get_course_list(key))
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def demo_view(request):
    """
    Provides demo data for testing purposes and for users who don't have an API key yet.
    """
    try:
        return Response(load_test_data())
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def verification_view(request):
    """
    Verifies the provided API key.
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_400_BAD_REQUEST)

    key = extract_key_from_header(auth_header)
    if not key:
        return Response({"error": "Authorization header must be Bearer token."}, status=status.HTTP_400_BAD_REQUEST)

    if verify_api_key(key):
        return Response({"message": "API Key is valid."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid API key."}, status=status.HTTP_401_UNAUTHORIZED)
    