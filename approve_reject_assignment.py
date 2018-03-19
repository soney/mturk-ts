import boto3
import json

with open('mturk_creds.json') as f:
	creds = json.loads(f.read())
MTURK_SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'

client = boto3.client('mturk', 
	aws_access_key_id=creds['access'],
	aws_secret_access_key=creds['secret'],
	region_name='us-east-1',
	endpoint_url = MTURK_SANDBOX
	)

def approve_assignment(ass_id, feedback='', override=False):
	status = client.get_assignment(AssignmentId=ass_id)['Assignment']['AssignmentStatus']
	if status=='Submitted':
		response = client.approve_assignment(
			AssignmentId=ass_id,
			RequesterFeedback=feedback,
			OverrideRejection=override)
	else:
		print("The assignment status is not submitted but {}".format(status))

def reject_assignment(ass_id, feedback=''):
	status = client.get_assignment(AssignmentId=ass_id)['Assignment']['AssignmentStatus']
	if status=='Submitted':
		response = client.reject_assignment(
			AssignmentId=ass_id,
			RequesterFeedback=feedback)
	else:
		print("The assignment status is not submitted but {}".format(status))
		