import json
import boto3

with open('mturk_creds.json') as f:
    creds = json.loads(f.read())
MTURK_SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'

client = boto3.client('mturk',
    aws_access_key_id=creds['access'],
    aws_secret_access_key=creds['secret'],
    region_name='us-east-1'
    )

APPROVE_RATE = 0.1
AGREEMENT_COUNT = 2

results = {}
completed = {}
no_posting = {
    'pending': [],
    'completed': []
}
approve_ids = set()
reject_ids = set()
issue_feedbacks = {}

with open('result.json') as f:
    data = json.load(f)


def create_new_qualification(issue_id):
    try:
        response = client.create_qualification_type(
            Name=issue_id,
            Description='You have already answered this question',
            QualificationTypeStatus='Active'
        )
        return response['QualificationType']['QualificationTypeId']
    except Exception as e:
        print("ERROR")
        return ''

def grant_workers_qualification(workers, qualification_id):
    for worker in workers:
        client.associate_qualification_with_worker(
            QualificationTypeId=qualification_id,
            WorkerId=worker
        )

def update_issue_qualification(results):
    issue_qualification = {}
    with open('issue_qualification.json') as f:
        issue_qualification = json.load(f)
    for issue_id in results:
        qualification_id = ''
        temp_issue = {}
        for comment_id in results[issue_id]:
            if len(results[issue_id][comment_id]['responses']) == 0:
                break
            temp_issue['workers'] = []
            for worker_id in results[issue_id][comment_id]['responses']:
                temp_issue['workers'].append(worker_id)
            workers_to_assign_qualification = []
            if issue_id in issue_qualification:
                workers_to_assign_qualification = list(set(temp_issue['workers']) - set(issue_qualification[issue_id]['workers']))
                qualification_id = issue_qualification[issue_id]['qualification_id']
            else:
                workers_to_assign_qualification = temp_issue['workers']
                qualification_id = create_new_qualification(issue_id)
                if qualification_id=='':
                    break
                temp_issue['qualification_id'] = qualification_id
                issue_qualification[issue_id] = temp_issue
            issue_qualification[issue_id]['workers'] = temp_issue['workers']
            grant_workers_qualification(workers_to_assign_qualification, qualification_id)
            break
    with open('issue_qualification.json', 'w') as f_out:
        f_out.write(json.dumps(issue_qualification))


for key in data:
    if '_' not in key:
        if key not in issue_feedbacks:
            issue_feedbacks[key] = []
        issue_feedbacks[key].append(data[key])
    else:
        issue_id, comment_id = key.split('_')
        if issue_id not in results:
            results[issue_id] = {}
        results[issue_id][comment_id] = data[key]

update_issue_qualification(results)

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

with open('feedbacks.json', 'w') as f:
    f.write(json.dumps(issue_feedbacks))

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
