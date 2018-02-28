import json

results = {}
completed = {}
with open('result.json') as f:
    data = json.load(f)

for key in data:
    issue_id, comment_id = key.split('_')
    if issue_id not in results:
        results[issue_id] = {}
    results[issue_id][comment_id] = data[key]

for issue_id in results:
    issue_agree = {}
    for comment_id in results[issue_id]:
        comment_agree = {}
        for response in results[issue_id][comment_id]:
            for ans in response:
                if ans not in comment_agree:
                    comment_agree[ans] = 0
                comment_agree[ans] += 1
                if comment_agree[ans] > 1:
                    issue_agree[comment_id] = comment_agree
    if len(issue_agree) == len(results[issue_id]):
        completed[issue_id] = {}
        completed[issue_id][comment_id] = issue_agree
        completed[issue_id]["num_responders"] = len(next(iter(results[issue_id].values())))
with open('completed.json', 'a') as f:
    f.write(json.dumps(completed))