from collections import defaultdict


def analyse_by_question(questions_raw):
    res = {}

    for question_key, question_data in questions_raw.items():
        scores = question_data['scores']
        attempted = question_data['attempted']
        checked = question_data['checked']
        aggr_data = {}

        aggr_data['# Not checked'] = checked.count(False)
        aggr_data['# Not attempted'] = attempted.count(False)
        aggr_data['# Incorrect'] = sum([score == 0 and attempt == True for (score, attempt) in zip(scores, attempted)])
        aggr_data['# Partially correct'] = sum(0 < score < 1 for score in scores)
        aggr_data['# Fully correct'] = scores.count(1)
        aggr_data['Partial marks'] = [score for score in scores if 0 < score < 1]

        res[question_key] = aggr_data
    
    return res


def analyse_by_exercise(questions_data):
    aggr_results = defaultdict(lambda: {'# Not checked': 0, '# Not attempted': 0, '# Incorrect': 0, '# Partially correct': 0, '# Fully correct': 0, 'Partial marks': []})

    for question_id, results in questions_data.items():
        exercise_number = ''.join(filter(str.isdigit, question_id))
        for key, value in results.items():
            aggr_results[exercise_number][key] += value

    return dict(aggr_results)
