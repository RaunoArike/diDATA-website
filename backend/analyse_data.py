from collections import defaultdict, Counter


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
        aggr_data['Partial marks'] = dict(Counter([score for score in scores if 0 < score < 1]))

        res[question_key] = aggr_data
    
    return res


def analyse_by_exercise(questions_raw):
    aggr_results = defaultdict(lambda: {
        '# Not checked': 0, 
        '# Not attempted': 0,
        'Student Scores': defaultdict(lambda: {'total_score': 0, 'attempts': 0})
    })

    for question_id, question_data in questions_raw.items():
        exercise_number = ''.join(filter(str.isdigit, question_id))
        scores = question_data['scores']
        attempted = question_data['attempted']
        checked = question_data['checked']
        
        aggr_results[exercise_number]['# Not checked'] += checked.count(False)
        aggr_results[exercise_number]['# Not attempted'] += attempted.count(False)

        for i, score in enumerate(scores):
            if attempted[i] and checked[i]:
                aggr_results[exercise_number]['Student Scores'][i]['total_score'] += score
                aggr_results[exercise_number]['Student Scores'][i]['attempts'] += 1

    res = defaultdict(lambda: {
        '# Not checked': 0, 
        '# Not attempted': 0, 
        '# Fully correct': 0,
        '# Incorrect': 0,
        '# Partially correct': 0,
        'Partial marks': {}
    })

    for exercise, data in aggr_results.items():
        partial_marks = []
        for student_id, scores_data in data['Student Scores'].items():
            if scores_data['attempts'] > 0:
                avg = scores_data['total_score'] / scores_data['attempts']
                if avg == 1:
                    res[exercise]["Fully correct"] += 1
                elif avg == 0:
                    res[exercise]["# Incorrect"] += 1
                else:
                    partial_marks.append(avg)
                    res[exercise]["# Partially correct"] += 1
        res[exercise]["# Not checked"] = data["# Not checked"]
        res[exercise]["# Not attempted"] = data['# Not attempted']
        res[exercise]["Partial marks"] = dict(Counter(partial_marks))

    return dict(res)
