def analyse_by_question(questions_raw):
    res = {}

    for question_key, question_data in questions_raw.items():
        full_marks = []
        no_marks = []
        partial_marks = []
        not_attempted = []
        not_checked = []

        scores = question_data['scores']
        attempted = question_data['attempted']
        checked = question_data['checked']

        full_marks_count = scores.count(1)
        full_marks.append(full_marks_count)
        
        no_marks_count = sum([score == 0 and attempt == True for (score, attempt) in zip(scores, attempted)])
        no_marks.append(no_marks_count)
        
        partial_marks_count = sum(0 < score < 1 for score in scores)
        partial_marks.append(partial_marks_count)
        
        not_attempted_count = attempted.count(False)
        not_attempted.append(not_attempted_count)
        
        not_checked_count = checked.count(False)
        not_checked.append(not_checked_count)

        aggr_data = {}

        aggr_data['# not checked'] = not_checked
        aggr_data['# not attempted'] = not_attempted
        aggr_data['# 0% correct'] = no_marks
        aggr_data['# partially correct'] = partial_marks
        aggr_data['# 100% correct'] = full_marks

        res[question_key] = aggr_data
    
    return res


def analyse_by_exercise(questions_data):
    from collections import defaultdict
    import itertools

    questions_data = analyse_by_question(questions_data)

    merged_results = defaultdict(lambda: defaultdict(list))

    for key, data in questions_data.items():
        prefix = ''.join(itertools.takewhile(str.isdigit, key))

        for subkey, sublist in data.items():
            if merged_results[prefix][subkey]:
                merged_results[prefix][subkey] = [sum(x) for x in zip(merged_results[prefix][subkey], sublist)]
            else:
                merged_results[prefix][subkey] = sublist

    print(merged_results)

    return {k: dict(v) for k, v in merged_results.items()}
