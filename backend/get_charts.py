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
    for assignment in assignment_list:
        if assignment["id"] == assignment_id:
            return assignment

    logger.error(f"Assignment API Request Failed: {status.HTTP_500_INTERNAL_SERVER_ERROR}")
    return Response({'error': 'Failed to retrieve assignment with the given id'}, status=500)


# Queries the results for a specific assignment from ANS
# The results are returned as a list where every entry corresponds to one student
# The querying logic is paginated to make sure all the data is retrieved even when the course has a very large number of students
# Returns a list containing the ids of each submission, a list of grades, and the time of last update of the returned data
# If the data is available in the database and the user hasn't requested to update it, the data is returned from the database and no API call is performed
def get_assignment_results(course_code, assignment_id, api_key, update=False):
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
            results = requests.get("https://edu.ans.app/api/v2/assignments/"+str(assignment_id)+"/results?items=100&page="+str(k+1), headers=header)
            results_json = results.json()
            if results_json==[] or results_json[0]['id'] == prev_id:
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
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
    


# Given a course, an assignment, and the ids of the student submissions, returns the detailed scores of the submissions by question and by exercise
# If the data is available in the database and the user hasn't requested to update it, the data is returned from the database and no API call is performed
def get_single_assignment_data(course_code, assignment_id, result_ids, api_key, update=False):
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
            response = requests.get("https://edu.ans.app/api/v2/results/"+str(res), headers=header).json()
            if response["users"][0]["student_number"] != None:
                for submission in response["submissions"]:
                    res_data[submission["numeral"]]["checked"].append(submission["raw_score"] != None and submission["score"] != None)
                    res_data[submission["numeral"]]["attempted"].append(not submission["none_above"])
                    res_data[submission["numeral"]]["scores"].append(float(submission["score"]) if submission["score"] != None else float('nan'))
        
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
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
