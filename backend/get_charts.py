import requests
import logging
from django.conf import settings
from .utils import natural_keys, group_data, analyse_data
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def find_assignment(assignment_list, assignment_id):
    for assignment in assignment_list:
        if assignment["id"] == assignment_id:
            return assignment

    logger.error(f"Assignment API Request Failed: {status.HTTP_500_INTERNAL_SERVER_ERROR}")
    return Response({'error': 'Failed to retrieve assignment with the given id'}, status=500)


def get_assignment_results(assignment_id):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}

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
        
        return result_ids

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return Response({'error': 'An error occurred while processing your request.'}, status=500)
    


def get_single_assignment_data(result_ids):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}
    numeral = []
    checked = []
    made = []
    question_scores = []

    for res in result_ids:
        response = requests.get("https://edu.ans.app/api/v2/results/"+str(res), headers=header).json()
        if response["users"][0]["student_number"] != None:
            for submission in response["submissions"]:
                numeral.append(submission["numeral"])
                checked.append(submission["raw_score"] != None and submission["score"] != None)
                made.append(not submission["none_above"])
                question_scores.append(float(submission["score"]) if submission["score"] != None else float('nan'))
    
    results = sort_and_organize_assignment_data(numeral, checked, made, question_scores)

    return results



def sort_and_organize_assignment_data(numeral, checked, made, question_scores):
    """
    Sorts and organizes assignment data based on question numerals.
    
    Parameters:
        numeral (list): List of question identifiers.
        checked (list): List indicating if questions were checked.
        attempted (list): List indicating if questions were attempted.
        question_scores (list): Scores for the questions.

    Returns:
        dict: A dictionary containing organized assignment data.
    """

    result_data = {
        'question': [],
        'scores': [],
        'checked': [],
        'attempted': []
    }

    idx = sorted(range(len(numeral)), key=lambda x: natural_keys(numeral[x]))
    
    result_data['question'] = [numeral[i] for i in idx]
    result_data['scores'] = [question_scores[i] for i in idx]
    result_data['checked'] = [checked[i] for i in idx]
    result_data['attempted'] = [made[i] for i in idx]

    result_data = group_data(result_data)
    result_data = analyse_data(result_data)

    return result_data
