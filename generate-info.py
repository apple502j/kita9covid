import csv
import json
import re
import requests

# Row name consts, should be changed when original data does
NO = "No"
DATE_SHARED = "公表_年月日"
DATE_ONSET = "発症_年月日"
LOCATION = "患者_居住地"
APPROX_AGE = "患者_年代"
GENDER = "患者_性別"
JOB = "患者_職業"
STATUS = "患者_状態"
SYMPTOM = "患者_症状"
HAS_TRAVELED = "患者_渡航歴の有無フラグ"
HAS_LEFT_HOSPITAL = "患者_退院済フラグ"

AGE_BELOW_TEN = {"0歳児", "10歳未満"}

REGEX = re.compile("(?:福岡|山口)県(?:北九州市)?")

citynames = set()
touched_dict = {}

def get_city_name(l):
    if not l:
        l = "不明"
    name = REGEX.sub("", l)
    citynames.add(name)
    return name

def approx_age_to_int(age):
    if age == '':
        return None
    if age in AGE_BELOW_TEN:
        return 0
    return int(age[:-1])

def flag(value):
    if value == '1':
        return True
    elif value == '0':
        return False
    return None

def ask_touched(i):
    i = int(i)
    v = input(f"{i}の濃厚接触者Noを入力 ない場合は0 不明の場合は空 >")
    if v == '0':
        return []
    elif v == '':
        return None
    l = [int(n) for n in v.split()]
    for n in l:
        try:
            touched_dict[n].append(i)
        except (KeyError, AttributeError):
            touched_dict[n] = [i]
    return l

url = input("URL >")
req = requests.get(url)
req.encoding = "shift-jis"

try:
    with open("./docs/info.json", "r", encoding="utf-8") as f:
        _results = json.load(f)
except:
    _results = []
starts_from = len(_results)
results = []

for row in csv.DictReader(req.text.split("\n")):
    i = int(row[NO])
    touched = None
    touched_by = None
    if i > starts_from or _results[i-1]["touching"] is None:
        touched = ask_touched(i)
    else:
        touched = _results[i-1]["touching"]
        touched_by = _results[i-1]["touched_by"]
    status = row[STATUS]
    results.append({
        "shared": row[DATE_SHARED] or None,
        "onset": row[DATE_ONSET] or None,
        "location": get_city_name(row[LOCATION]),
        "approx_age": approx_age_to_int(row[APPROX_AGE]),
        "gender": row[GENDER] or None,
        "job": row[JOB] or None,
        "status": row[STATUS] or None,
        "symptom": row[SYMPTOM] or None,
        "has_traveled": flag(row[HAS_TRAVELED]),
        "has_left_hospital": flag(row[HAS_LEFT_HOSPITAL]),
        "touching": touched,
        "touched_by": touched_by if touched_by is not None else touched_dict.get(i, None)
    })

with open("./docs/info.json", "w", encoding="utf-8") as f:
    json.dump(results, f)
with open("./docs/citynames.json", "w", encoding="utf-8") as f:
    json.dump(list(citynames), f)
