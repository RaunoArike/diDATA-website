import requests
import logging
from django.conf import settings
from .get_assignments import get_assignment_list
from .get_charts import get_assignment_results, get_single_assignment_data, find_assignment
from .get_courses import get_course_list
from .get_test_data import load_test_data
from .verify import verify_api_key
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


logger = logging.getLogger(__name__)

@api_view(['GET'])
def chart_view(request, course_code, assignment_id, **kwargs):
    update = kwargs.get('update', False)
    auth_header = request.headers.get('Authorization')
    
    if auth_header:
        parts = auth_header.split()
        
        if len(parts) == 2 and parts[0] == 'Bearer':
            key = parts[1]
            try:
                assignments = get_assignment_list(course_code, key)
                assignment = find_assignment(assignments, assignment_id)
                result_ids, grades, last_updated = get_assignment_results(course_code, assignment["id"], key, update)
                results_by_question, results_by_exercise = get_single_assignment_data(course_code, assignment["id"], result_ids, key, update)
                response = Response({"results_by_question": results_by_question, "results_by_exercise": results_by_exercise, "grades": grades, "assignment_name": assignment["name"], "last_updated": last_updated})
                print(response)
                return response
            
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed: {e}")
                return Response({'error': 'An error occurred while processing your request.'}, status=500)


@api_view(['GET'])
def assignments_view(request, course_code):
    auth_header = request.headers.get('Authorization')
    
    if auth_header:
        parts = auth_header.split()
        
        if len(parts) == 2 and parts[0] == 'Bearer':
            key = parts[1]
            try:
                return Response(get_assignment_list(course_code, key))
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed: {e}")
                return Response({'error': 'An error occurred while processing your request.'}, status=500)
            # TODO: Return different error codes for auth errors and processing errors


@api_view(['GET'])
def courses_view(request):
    auth_header = request.headers.get('Authorization')
    if auth_header:
        parts = auth_header.split()
        
        if len(parts) == 2 and parts[0] == 'Bearer':
            key = parts[1]
            try:
                return Response(get_course_list(key))

            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed: {e}")
                return Response({'error': 'An error occurred while processing your request.'}, status=500)
    

@api_view(['GET'])
def demo_view(request):
    try:
        return Response(load_test_data())

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)


@api_view(['POST'])
def verification_view(request):
    auth_header = request.headers.get('Authorization')
    
    if auth_header:
        parts = auth_header.split()
        
        if len(parts) == 2 and parts[0] == 'Bearer':
            key = parts[1]

            if verify_api_key(key):
                return Response({"message": "API Key is valid."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid API key."}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"error": "Authorization header must be Bearer token."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({"error": "Authorization header is missing."}, status=status.HTTP_400_BAD_REQUEST)
