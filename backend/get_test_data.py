import pandas as pd
import os
from collections import defaultdict
from .analyse_data import analyse_by_question, analyse_by_exercise


# Loads fake data, which is displayed for demo purposes to teachers who wish to use the app but don't have an ANS API key yet
def load_test_data():
    script_dir = os.path.dirname(__file__)
    relative_path = '../test_data/test.csv'
    file_path = os.path.join(script_dir, relative_path)
    df = pd.read_csv(file_path)
    df = df.fillna(0)
    df = df.drop(columns=['Studentnumber'])

    res = defaultdict(lambda: defaultdict(list))
    for key, val in df.to_dict().items():
        values = list(val.values())
        res[key]["checked"] = [True] * len(values)
        res[key]["attempted"] = [True] * len(values)
        res[key]["scores"] = values

    results_by_question = analyse_by_question(res)
    results_by_exercise = analyse_by_exercise(res)
    return {"results_by_question": results_by_question, "results_by_exercise": results_by_exercise, "grades": {"Pass": [5.75, 8.4, 6.3], "Fail": [2.4, 3.0, 5.0]}, "assignment_name": "Demo data", "last_updated": "N/A"}
