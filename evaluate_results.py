import json

APPROVE_RATE = 0.6
AGREEMENT_COUNT = 2

results = {}
completed = {}
no_posting = {
    'pending': [],
    'completed': []
}
approve_ids = set()
reject_ids = set()
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
        if results[issue_id][comment_id]['pending']:
            no_posting['pending'].append(issue_id)
        if not results[issue_id][comment_id]['responses']:
            break

        comment_agree = {}
        responses = results[issue_id][comment_id]['responses']
        for worker_id in responses:
            answers = responses[worker_id]['response']
            assignment_id = responses[worker_id]['assignment_id']
            for ans in answers:
                if ans not in comment_agree:
                    comment_agree[ans] = []
                comment_agree[ans].append(assignment_id)
        if len(max(comment_agree.values(), key=len)) >= AGREEMENT_COUNT:
            issue_agree[comment_id] = comment_agree
    # if # of agreed comments == # of total comments
    if len(issue_agree) == len(results[issue_id]):
        completed[issue_id] = {}
        no_posting['completed'].append(issue_id)
        completed[issue_id]['agree_comments'] = issue_agree
        assignment_id_to_correct_count = {}
        for comment_id, label_to_assignment_ids in issue_agree.items():
            for label in label_to_assignment_ids:
                assignment_ids = label_to_assignment_ids[label]
                for assignment_id in assignment_ids:
                    if assignment_id not in assignment_id_to_correct_count:
                        assignment_id_to_correct_count[assignment_id] = 0
                    if len(assignment_ids) >= AGREEMENT_COUNT:
                        assignment_id_to_correct_count[assignment_id] += 1
        for assignment_id, correct_count in assignment_id_to_correct_count.items():
            if correct_count / len(results[issue_id]) > APPROVE_RATE:
                approve_ids.add(assignment_id)
            else:
                reject_ids.add(assignment_id)

with open('completed.json', 'w') as f:
    f.write(json.dumps(completed))

with open('no_posting.json', 'w') as f:
    f.write(json.dumps(no_posting))

print(list(approve_ids))
with open('approve_ids.json', 'w') as f:
    f.write(json.dumps(list(approve_ids)))

print(list(reject_ids))
with open('reject_ids.json', 'w') as f:
    f.write(json.dumps(list(reject_ids)))
