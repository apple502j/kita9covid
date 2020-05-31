import json
import sys

if len(sys.argv) != 2:
    sys.exit(1)
try:
    pid = int(sys.argv[1]) - 1
except ValueError:
    print("ID is int", file=sys.stderr)
    sys.exit(1)

with open("./docs/info.json", "r", encoding="utf-8") as f:
    info = json.load(f)

try:
    touching = info[pid]["touching"].copy()
except KeyError:
    print("ID does not exist", file=sys.stderr)
    sys.exit(1)

new_ids = [int(i) for i in input("追加するIDまたは削除するIDを指定 >").split(" ")]
for i in new_ids:
    if i < 0:
        touching.remove(abs(i))
    else:
        touching.append(i)

info[pid]["touching"] = touching
with open("./docs/info.json", "w", encoding="utf-8") as f:
    json.dump(info, f)
