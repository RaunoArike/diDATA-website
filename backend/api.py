import requests
import logging
from django.conf import settings
from .get_assignments import get_assignment_list
from .get_charts import get_assignment_results, get_single_assignment_data, find_assignment
from .get_courses import get_course_list
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


logger = logging.getLogger(__name__)

@api_view(['GET'])
def chart_view(request, course_code, assignment_id):
    try:
        assignments = get_assignment_list(course_code)
        assignment = find_assignment(assignments, assignment_id)
        result_ids = get_assignment_results(course_code, assignment["id"])
        result_data = get_single_assignment_data(course_code, assignment["id"], result_ids)
        return Response({"results": result_data, "assignment_name": assignment["name"]})
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)


@api_view(['GET'])
def assignments_view(request, course_code):
    try:
        return Response(get_assignment_list(course_code))
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)


@api_view(['GET'])
def courses_view(request):
    try:
        return Response(get_course_list())

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
