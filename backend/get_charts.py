import requests
import logging
from .analyse_data import analyse_by_question, analyse_by_exercise
from rest_framework.response import Response
from rest_framework import status
from collections import defaultdict
from .models import AssignmentData, AssignmentResults
import json

logger = logging.getLogger(__name__)


def find_assignment(assignment_list, assignment_id):
    """
    Finds and returns an assignment from the list of assignments using the assignment_id.
    
    Args:
        assignment_list (list): List of assignments.
        assignment_id (str): The ID of the assignment to find.
    
    Returns:
        dict: The assignment with the specified ID or logs an error if not found.
    """
    for assignment in assignment_list:
        if assignment["id"] == assignment_id:
            return assignment

    logger.error(f"Assignment not found with ID: {assignment_id}")
    raise Exception(f"Assignment not found with ID: {assignment_id}")


def get_assignment_results(course_code, assignment_id, api_key, update=False):
    """
    Queries and returns the results for a specific assignment from ANS. 
    The results include a list of submission IDs, grades, and the last update time.
    If the data is available in the database and update is False, the data is retrieved from the database.
    
    Args:
        course_code (str): The course code.
        assignment_id (str): The assignment ID.
        api_key (str): The API key for authentication.
        update (bool): Whether to update the data from the API.
    
    Returns:
        tuple: A tuple containing a list of submission IDs, grades, and last update time.
    """
    header = {"accept": "application/json", "Authorization": f"Bearer {api_key}"}

    if not update:
        try:
            stored_data = AssignmentResults.objects.get(course_code=course_code, assignment_id=assignment_id)
            return stored_data.get_result_ids(), stored_data.get_grades(), stored_data.last_updated
        except AssignmentResults.DoesNotExist:
            pass

    try:
        prev_id = ""
        result_ids = []
        grades = {
            "Pass": [],
            "Fail": []
        }
        for k in range(10):
            results = requests.get(f"https://edu.ans.app/api/v2/assignments/{assignment_id}/results?items=100&page={k+1}", headers=header)
            results.raise_for_status()
            results_json = results.json()
            if not results_json or results_json[0]['id'] == prev_id:
                break
            prev_id = results_json[0]['id']
            for res in results_json:
                if res.get("submitted_at"):
                    result_ids.append(res["id"])
                    grade = res["grade"]
                    print(float(grade))
                    if float(grade) >= 5.75:
                        grades["Pass"].append(grade)
                    else:
                        grades["Fail"].append(grade)
        
        AssignmentResults.objects.update_or_create(
            course_code=course_code,
            assignment_id=assignment_id,
            defaults={
                'result_ids': json.dumps(result_ids),
                'grades': json.dumps(grades)
            }
        )
        stored_data = AssignmentResults.objects.get(course_code=course_code, assignment_id=assignment_id)

        return result_ids, grades, stored_data.last_updated

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        raise
    


def get_single_assignment_data(course_code, assignment_id, result_ids, api_key, update=False):
    """
    Returns the detailed scores of the submissions by question and by exercise for a given course and assignment.
    If the data is available in the database and update is False, the data is retrieved from the database.
    
    Args:
        course_code (str): The course code.
        assignment_id (str): The assignment ID.
        result_ids (list): The IDs of the student submissions.
        api_key (str): The API key for authentication.
        update (bool): Whether to update the data from the API.
    
    Returns:
        tuple: A tuple containing results by question and results by exercise.
    """
    header = {"accept": "application/json", "Authorization": f"Bearer {api_key}"}

    if not update:
        try:
            stored_data = AssignmentData.objects.get(course_code=course_code, assignment_id=assignment_id)
            results_by_question = stored_data.data['results_by_question']
            results_by_exercise = stored_data.data['results_by_exercise']
            return results_by_question, results_by_exercise
        except AssignmentData.DoesNotExist:
            pass
    
    try:
        res_data = defaultdict(lambda: defaultdict(list))

        for res in result_ids:
            response = requests.get(f"https://edu.ans.app/api/v2/results/{res}", headers=header)
            response.raise_for_status()
            response_json = response.json()
            if response_json["users"][0]["student_number"] is not None:
                for submission in response_json["submissions"]:
                    res_data[submission["numeral"]]["checked"].append(submission["raw_score"] is not None and submission["score"] is not None)
                    res_data[submission["numeral"]]["attempted"].append(not submission["none_above"])
                    res_data[submission["numeral"]]["scores"].append(float(submission["score"]) if submission["score"] is not None else float('nan'))
        
        results_by_question = analyse_by_question(res_data)
        results_by_exercise = analyse_by_exercise(results_by_question)

        AssignmentData.objects.update_or_create(
            course_code=course_code,
            assignment_id=assignment_id,
            defaults={'data': {'results_by_question': results_by_question, 'results_by_exercise': results_by_exercise}}
        )

        return results_by_question, results_by_exercise
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
