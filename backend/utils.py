import re
import pandas as pd

def atoi(text):
    return int(text) if text.isdigit() else text

def natural_keys(text):
    '''
    alist.sort(key=natural_keys) sorts in human order
    http://nedbatchelder.com/blog/200712/human_sorting.html
    (See Toothy's implementation in the comments)
    '''
    return [atoi(c) for c in re.split(r'(\d+)', text)]

def group_data(data):
    df = pd.DataFrame(data)
    grouped = df.groupby('question').agg(list)
    questions_raw = grouped.to_dict('index')
    
    for question, details in questions_raw.items():
        questions_raw[question] = {
            'scores': [details['scores']],
            'checked': [details['checked']],
            'attempted': [details['attempted']]
        }
    
    return questions_raw

def analyse_data(questions_raw):
    res = {}

    for question_key, question_data in questions_raw.items():
        full_marks = []
        no_marks = []
        partial_marks = []
        not_attempted = []
        not_checked = []

        for scores, attempted, checked in zip(question_data['scores'], question_data['attempted'], question_data['checked']):
            full_marks_count = scores.count(1)
            full_marks.append(full_marks_count)
            
            no_marks_count = scores.count(0)
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
        aggr_data['# partially correct'] = partial_marks
        aggr_data['# 0% correct'] = no_marks
        aggr_data['# 100% correct'] = full_marks

        res[question_key] = aggr_data
    
    return res
