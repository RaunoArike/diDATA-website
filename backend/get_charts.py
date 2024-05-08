import requests
import logging
from django.conf import settings
from .utils import analyse_data
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from collections import defaultdict
from .get_test_data import load_test_data
from .models import AssignmentData, AssignmentResults
import json

logger = logging.getLogger(__name__)


def find_assignment(assignment_list, assignment_id):
    for assignment in assignment_list:
        if assignment["id"] == assignment_id:
            return assignment

    logger.error(f"Assignment API Request Failed: {status.HTTP_500_INTERNAL_SERVER_ERROR}")
    return Response({'error': 'Failed to retrieve assignment with the given id'}, status=500)


def get_assignment_results(course_code, assignment_id):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}

    try:
        stored_data = AssignmentResults.objects.get(course_code=course_code, assignment_id=assignment_id)
        return stored_data.get_result_ids()
    except AssignmentResults.DoesNotExist:
        pass

    try:
        prev_id = ""
        result_ids = []
        for k in range(10):
            results = requests.get("https://edu.ans.app/api/v2/assignments/"+str(assignment_id)+"/results?items=100&page="+str(k+1), headers=header)
            results_json = results.json()
            if results_json==[] or results_json[0]['id'] == prev_id:
                break
            prev_id = results_json[0]['id']
            for res in results_json:
                if res["submitted_at"]:
                    result_ids.append(res["id"])
        
        AssignmentResults.objects.update_or_create(
            course_code=course_code,
            assignment_id=assignment_id,
            defaults={'result_ids': json.dumps(result_ids)}
        )

        return result_ids

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
    


def get_single_assignment_data(course_code, assignment_id, result_ids):
    # return load_test_data()

    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}

    try:
        stored_data = AssignmentData.objects.get(course_code=course_code, assignment_id=assignment_id)
        return stored_data.get_data()
    except AssignmentData.DoesNotExist:
        pass
    
    try:
        res_data = defaultdict(lambda: defaultdict(list))

        for res in result_ids:
            response = requests.get("https://edu.ans.app/api/v2/results/"+str(res), headers=header).json()
            if response["users"][0]["student_number"] != None:
                for submission in response["submissions"]:
                    res_data[submission["numeral"]]["checked"].append(submission["raw_score"] != None and submission["score"] != None)
                    res_data[submission["numeral"]]["attempted"].append(not submission["none_above"])
                    res_data[submission["numeral"]]["scores"].append(float(submission["score"]) if submission["score"] != None else float('nan'))
        
        results = analyse_data(res_data)

        AssignmentData.objects.update_or_create(
            course_code=course_code,
            assignment_id=assignment_id,
            defaults={'data': json.dumps(results)}
        )

        return results
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
