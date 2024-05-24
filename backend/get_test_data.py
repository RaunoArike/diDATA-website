import pandas as pd
import os
from collections import defaultdict
from .utils import analyse_by_question


def load_test_data():
    script_dir = os.path.dirname(__file__)
    relative_path = '../test_data/test.csv'
    file_path = os.path.join(script_dir, relative_path)
    df = pd.read_csv(file_path)
    df = df.fillna(0)
    print(df.keys())
    df = df.drop(columns=['Studentnumber'])

    res = defaultdict(lambda: defaultdict(list))
    for key, val in df.to_dict().items():
        values = list(val.values())
        res[key]["checked"] = [True] * len(values)
        res[key]["attempted"] = [True] * len(values)
        res[key]["scores"] = values

    return analyse_by_question(res)
