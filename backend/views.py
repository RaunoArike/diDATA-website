from django.http import JsonResponse
from django.shortcuts import render
import requests
import logging
from django.conf import settings
from .utils import natural_keys, group_data, analyse_data

logger = logging.getLogger(__name__)

def sample_data_view(request):
    assignments = get_assignment_list(1045)
    coz_assignment_ids, coz_assignment_names = get_coz_assignments(assignments)
    assignment_results = get_assignment_results(coz_assignment_ids, coz_assignment_names)
    assignment_data = get_single_assignment_data(assignment_results, 0)
    return JsonResponse(assignment_data)


def assignments_view(request):
    assignment_names = []
    assignments = get_assignment_list(1045)
    for assignment in assignments:
        assignment_names.append(assignment["name"])
    return JsonResponse({"assignments": assignment_names})


def get_assignment_list(course_code):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}
    try:
        assignments_response = requests.get(f"https://edu.ans.app/api/v2/courses/{course_code}/assignments", headers=header)

        logger.info(f"Assignment API Response Status: {assignments_response.status_code}")

        if assignments_response.status_code == 200:
            assignments_json = assignments_response.json()
            return assignments_json
        else:
            logger.error(f"Assignment API Request Failed: {assignments_response.status_code}")
            return JsonResponse({'error': 'Failed to retrieve assignments'}, status=assignments_response.status_code)

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return JsonResponse({'error': 'An error occurred while processing your request.'}, status=500)
    


def get_coz_assignments(assignment_list):
    assignment_ids = []
    assignment_names = []

    for assignment in assignment_list:
        if 'COZ' in assignment['name']:
            assignment_ids.append(assignment['id'])
            assignment_names.append(assignment["name"])

    logger.info(f"COZ Assignment names: {assignment_names}")

    return assignment_ids, assignment_names


def get_assignment_results(assignment_ids, assignment_names):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}
    assignment_results = []

    try:
        for i, name in zip(assignment_ids, assignment_names):
            prev_id = ""
            result_ids = []
            for k in range(10):
                results = requests.get("https://edu.ans.app/api/v2/assignments/"+str(i)+"/results?items=100&page="+str(k+1), headers=header)
                results_json = results.json()
                if results_json==[] or results_json[0]['id'] == prev_id:
                    break
                prev_id = results_json[0]['id']
                for res in results_json:
                    if res["submitted_at"]:
                        result_ids.append(res["id"])

            if len(result_ids) > 0:
                assignment_results.append({'name': name, 'result_ids': result_ids})
        
        return assignment_results

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return JsonResponse({'error': 'An error occurred while processing your request.'}, status=500)
    


def get_single_assignment_data(assignment_results, idx):
    header = {"accept": "application/json", "Authorization": settings.AUTH_TOKEN}
    numeral = []
    checked = []
    made = []
    question_scores = []

    for res in assignment_results[idx]['result_ids']:
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






def index(request):
    return render(request, 'index.html')