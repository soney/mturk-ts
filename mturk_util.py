import json
import boto3
import hashlib
import random
import sys

class MturkUtil:
    MTURK_SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'
    RAW_FILE = 'result.json'
    COMPLETED = 'completed.json'
    PROCESS = 'process.json'
    APPROVE = 'approve_ids.json'
    REJECT = 'reject_ids.json'
    ISSUE_FEEDBACK = 'issue_feedback.json'
    ISSUE_QUALIFICATION = 'issue_qualification.json'
    CREDS = 'mturk_creds.json'
    NO_POST = 'no_post.json'
    CORRECT_RATE = 0.1
    AGREEMENT_COUNT = 2

    def __init__(self, sandbox=True):
        self.h = hashlib.sha256()

        self.retrieved_results = {}
        # read completed
        with open(self.COMPLETED, 'r') as f:
            self.completed = json.load(f)

        # read no post
        with open(self.NO_POST, 'r') as f:
            no_post = json.load(f)
        self.completed_set = set(no_post['completed'])
        self.pending = set(no_post['pending'])

        # read process
        with open(self.PROCESS, 'r') as f:
            self.process = json.load(f)

        # read issue feedback
        with open(self.ISSUE_FEEDBACK, 'r') as f:
            self.issue_feedback = json.load(f)

        # read approve ids
        with open(self.APPROVE, 'r') as f:
            self.approve = set(json.load(f))

        # read reject ids
        with open(self.REJECT, 'r') as f:
            self.reject = set(json.load(f))

        with open(self.ISSUE_QUALIFICATION, 'r') as f:
            self.issue_qualification = json.load(f)

        with open(self.CREDS, 'r') as f:
            creds = json.load(f)

        if sandbox:
            print('Start Mturk Util with sandbox')
            self.client = boto3.client('mturk',
                                       aws_access_key_id = creds['access'],
                                       aws_secret_access_key = creds['secret'],
                                       region_name = 'us-east-1',
                                       endpoint_url = self.MTURK_SANDBOX
                                       )
        else:
            print('Start Mturk Util with production')
            self.client = boto3.client('mturk',
                                       aws_access_key_id=creds['access'],
                                       aws_secret_access_key=creds['secret'],
                                       region_name='us-east-1'
                                       )

    def approve_assignment(self, assignment_id, feedback='', override=False):
        status = self.client.get_assignment(AssignmentId=assignment_id)['Assignment']['AssignmentStatus']
        if status == 'Submitted':
            self.client.approve_assignment(
                AssignmentId=assignment_id,
                RequesterFeedback=feedback,
                OverrideRejection=override
            )
        else:
            print("Approve failed: the assignment status is not submitted but {}".format(status))

    def reject_assignment(self, assignment_id, feedback=''):
        status = self.client.get_assignment(AssignmentId=assignment_id)['Assignment']['AssignmentStatus']
        if status == 'Submitted':
            self.client.reject_assignment(
                AssignmentId=assignment_id,
                RequesterFeedback=feedback
            )
        else:
            print("Reject failed: the assignment status is not submitted but {}".format(status))

    def process_raw_data(self):
        with open(self.RAW_FILE, 'r') as f:
            data = json.load(f)
        for key in data:
            if '_' not in key:
                self.get_new_issue_feedback(key, data[key]['responses'])
            else:
                self.get_retrieved_results(key, data[key])

    def get_new_qualification_type_id(self, issue_id):
        name_string = issue_id + str(random.randint(0, 9999))
        self.h.update(name_string.encode('UTF-8'))
        hash_name = self.h.hexdigest()
        response = self.client.create_qualification_type(
            Name=hash_name,
            Description='You have already answered this question',
            QualificationTypeStatus='Active'
        )
        return response['QualificationType']['QualificationTypeId']

    def grant_worker_qualification(self, worker_id, qualification_type_id):
        self.client.associate_qualification_with_worker(
            QualificationTypeId=qualification_type_id,
            WorkerId=worker_id
        )

    def process_retrieved_results(self):
        for issue_id in self.retrieved_results:
            workers = set()
            print(issue_id)
            for comment_id in self.retrieved_results[issue_id]:
                if self.retrieved_results[issue_id][comment_id]['pending']:
                    self.pending.add(issue_id)
                if not self.retrieved_results[issue_id][comment_id]['responses']:
                    # no one has responded this issue, check next issue id
                    if issue_id not in self.process:
                        self.process[issue_id] = {}
                    if comment_id not in self.process[issue_id]:
                        self.process[issue_id][comment_id] = {}
                    continue

                responses = self.retrieved_results[issue_id][comment_id]['responses']
                if issue_id in self.completed:
                    self.update_completed(issue_id, comment_id, responses, workers)
                else:
                    print('heyheyhey')
                    self.update_process(issue_id, comment_id, responses, workers)

            if issue_id not in self.issue_qualification:
                self.issue_qualification[issue_id] = {
                    'valid': False,
                    'workers': []
                }
            if not self.issue_qualification[issue_id]['valid']:
                # new_qualification_type_id = self.get_new_qualification_type_id(issue_id)
                new_qualification_type_id = "lalala"
                self.issue_qualification[issue_id]['q_id'] = new_qualification_type_id
                self.issue_qualification[issue_id]['valid'] = True
            record_workers = set(self.issue_qualification[issue_id]['workers'])
            record_workers.update(workers)
            self.issue_qualification[issue_id]['workers'] = list(record_workers)
            for worker_id in self.issue_qualification[issue_id]['workers']:
                self.grant_worker_qualification(worker_id, self.issue_qualification[issue_id]['q_id'])

            if self.is_issue_completed(issue_id):
                self.completed_set.add(issue_id)
                self.completed[issue_id] = self.process.pop(issue_id)

        no_post = {
            'completed': list(self.completed_set),
            'pending': list(self.pending)
        }
        with open(self.COMPLETED, 'w') as f:
            f.write(json.dumps(self.completed))
        with open(self.PROCESS, 'w') as f:
            f.write(json.dumps(self.process))
        with open(self.NO_POST, 'w') as f:
            f.write(json.dumps(no_post))
        with open(self.ISSUE_QUALIFICATION, 'w') as f:
            f.write(json.dumps(self.issue_qualification))

    def is_issue_completed(self, issue_id):
        agreed_count = 0
        for comment_id in self.process[issue_id]:
            comment_labels = self.process[issue_id][comment_id]
            if not comment_labels:
                return False
            if len(max(comment_labels.values(), key=len)) >= self.AGREEMENT_COUNT:
                agreed_count += 1
        return agreed_count == len(self.retrieved_results[issue_id])

    def update_completed(self, issue_id, comment_id, responses, worker_set):
        comment_labels = self.completed[issue_id][comment_id]
        for worker_id in responses:
            self.update_comment_dictionary(worker_id, responses, comment_labels)
            worker_set.add(worker_id)

    def update_process(self, issue_id, comment_id, responses, worker_set):
        if issue_id not in self.process:
            self.process[issue_id] = {}
        if comment_id not in self.process[issue_id]:
            self.process[issue_id][comment_id] = {}
        process_comment = self.process[issue_id][comment_id]
        for worker_id in responses:
            self.update_comment_dictionary(worker_id, responses, process_comment)
            worker_set.add(worker_id)

    def update_comment_dictionary(self, worker_id, responses, comment_dict):
        assignment_id = responses[worker_id]['assignment_id']
        labels = responses[worker_id]['response']
        for label in labels:
            if label not in comment_dict:
                comment_dict[label] = []
            if assignment_id not in comment_dict[label]:
                comment_dict[label].append(assignment_id)

    def get_new_issue_feedback(self, issue_id, feedback):
        if issue_id not in self.issue_feedback:
            self.issue_feedback[issue_id] = {}
        for worker_id in feedback:
            if worker_id not in self.issue_feedback[issue_id] and feedback[worker_id]['response']:
                self.issue_feedback[issue_id][worker_id] = {
                    'assignment_id': feedback[worker_id]['assignment_id'],
                    'feedback': feedback[worker_id]['response']
                }

    def get_retrieved_results(self, issue_comment_id, status_responses):
        issue_id, comment_id = issue_comment_id.split('_')
        if issue_id not in self.retrieved_results:
            self.retrieved_results[issue_id] = {}
        self.retrieved_results[issue_id][comment_id] = status_responses

    def update_approve_reject(self):
        for issue_id, agreed_comments in self.completed.items():
            assignment_id_to_correct_count = {}
            for comment_id, labels in agreed_comments.items():
                for label, assignment_ids in labels.items():
                    for assignment_id in assignment_ids:
                        if assignment_id not in assignment_id_to_correct_count:
                            assignment_id_to_correct_count[assignment_id] = 0
                        if len(assignment_ids) >= self.AGREEMENT_COUNT:
                            assignment_id_to_correct_count[assignment_id] += 1
            for assignment_id, correct_count in assignment_id_to_correct_count:
                if assignment_id not in self.approve and assignment_id not in self.reject:
                    if correct_count / len(self.completed[issue_id]) >= self.CORRECT_RATE:
                        self.approve.add(assignment_id)
                    else:
                        self.reject.add(assignment_id)

        with open(self.APPROVE, 'w') as f:
            f.write(json.dumps(list(self.approve)))
        with open(self.REJECT, 'w') as f:
            f.write(json.dumps(list(self.reject)))

    def evaluate_raw_data(self):
        self.process_raw_data()
        self.process_retrieved_results()
        self.update_approve_reject()

if __name__ == '__main__':
    mturk_util = MturkUtil()
    mturk_util.evaluate_raw_data()