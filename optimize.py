import json

with open("./docs/info.json", "r", encoding="utf-8") as f:
    info = json.load(f)

# key is 0-indexed, value is 1-indexed
touched_by = {}

for i in range(len(info)):
    if info[i]["touching"]:
        for n in info[i]["touching"]:
            try:
                # n is 1-indexed, i is 0-indexed
                touched_by[n-1].append(i+1)
            except (KeyError, AttributeError):
                touched_by[n-1] = [i+1]

for i in range(len(info)):
    if touched_by.get(i, None):
        info[i]["touched_by"] = touched_by[i]
    else:
        info[i]["touched_by"] = None

with open("./docs/info.json", "w", encoding="utf-8") as f:
    json.dump(info, f)
