from collections import defaultdict, Counter


# Takes the raw question data and converts it into a dictionary that contains the following elements for each question in an exercise:
# - the number of unchecked submissions by students
# - the number of submissions where the question was left unattempted
# - the number of incorrect submissions
# - the number of partially correct submissions
# - the number of fully correct submissions
# - an array that contains the exact scores assigned to all partially correct submissions
def analyse_by_question(questions_raw):
    res = {}

    for question_key, question_data in questions_raw.items():
        scores = question_data['scores']
        attempted = question_data['attempted']
        checked = question_data['checked']
        aggr_data = {}

        aggr_data['# Not checked'] = checked.count(False)
        aggr_data['# Not attempted'] = attempted.count(False)
        aggr_data['# Fully incorrect'] = sum([score == 0 and attempt == True for (score, attempt) in zip(scores, attempted)])
        aggr_data['# Partially correct'] = sum(0 < score < 1 for score in scores)
        aggr_data['# Fully correct'] = scores.count(1)
        aggr_data['Partial marks'] = dict(Counter([score for score in scores if 0 < score < 1]))

        res[question_key] = aggr_data
    
    return res


# Takes the raw question data and converts it into a dictionary that contains the following elements for each exercise:
# - the total number of unchecked questions across all questions categorized under the exercise across all submissions
# - the total number of unattempted questions across all questions categorized under the exercise across all submissions
# - the number of students who got all of their attempted and checked questions correct across the exercise
# - the number of students who got all of their attempted and checked questions incorrect across the exercise
# - the number of students who got some of their attempted and checked questions correct and some incorrect across the exercise
# - an array that contains the average marks of the students who got some of the questions correct and some incorrect across the exercise
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
        '# Fully incorrect': 0,
        '# Partially correct': 0,
        'Partial marks': {}
    })

    for exercise, data in aggr_results.items():
        partial_marks = []
        for student_id, scores_data in data['Student Scores'].items():
            if scores_data['attempts'] > 0:
                avg = scores_data['total_score'] / scores_data['attempts']
                if avg == 1:
                    res[exercise]["# Fully correct"] += 1
                elif avg == 0:
                    res[exercise]["# Fully incorrect"] += 1
                else:
                    partial_marks.append(avg)
                    res[exercise]["# Partially correct"] += 1
        res[exercise]["# Not checked"] = data["# Not checked"]
        res[exercise]["# Not attempted"] = data['# Not attempted']
        res[exercise]["Partial marks"] = dict(Counter(partial_marks))

    return dict(res)
