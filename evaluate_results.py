import json

results = {}
HITS_status = {}
with open('result.json') as f:
    data = json.load(f)

for key in data:
    issue_id, comment_id = key.split('_')
    if issue_id not in results:
        results[issue_id] = {}
    results[issue_id][comment_id] = data[key]

for issue_id in results:
    issue_agree = {}
    num_responders = 0
    for comment_id in results[issue_id]:
        comment_agree = {}
        num_responders = len(results[issue_id][comment_id])
        for response in results[issue_id][comment_id]:
            for ans in response:
                if ans not in comment_agree:
                    comment_agree[ans] = 0
                comment_agree[ans] += 1
        if max(comment_agree.values()) > 1:
            issue_agree[comment_id] = comment_agree
    HITS_status[issue_id] = {}
    if len(issue_agree) == len(results[issue_id]):
        HITS_status[issue_id]['status'] = 'completed'
        HITS_status[issue_id]['agree_comments'] = issue_agree
        HITS_status[issue_id]['num_responders'] = num_responders
    else:
        HITS_status[issue_id]['status'] = 'pending'
with open('HITS_status.json', 'w') as f:
    f.write(json.dumps(HITS_status))
