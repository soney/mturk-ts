# gh mining Mturk related commands
After finishing Setup step 2 in README.md, the following gh_mining posting and retrieving can be executed.
Suppose the processed ghtorrent json data is stored in `/somedir/memoized_db`.
## Posting HITs
```
npm start 1 /somedir/memoized_db
```
## Retrieving worker raw responses
```
npm start 2
```
The raw responses will overwrite result.json file every time.

### The rest of the gh_mining and Mturk functionalities are written in Python with boto3 ###
## Installing requirements for gh_mining
```
pip install -r requirements
```
The Python module has 2 Mturk options which are option 1, sandbox and option 2, production.

All intermediate files will be store in `record_data` directory.

Because Mturk service does not keep all responses, the files in `record_data` record all processed responses.

The following are descriptions of intermediate files:
- `approve_ids.json` contains the latest assignment ids that need to be approved
- `approved.json` contains all approved assignment ids
- `bad_issue_ids.json` contains all issue ids that have html tags in the comment bodies
- `completed.json` contains all agreed/completed issues
- `issue_feedback.json` contains the feedback from workers for each issue
- `issue_qualification.json` contains workers who have granted a qualification for a issue so that they cannot answer the issue again
- `labels.json` contains labels for all comments in one issue
- `no_post.json` contains completed issue ids and pending issue ids. Pending issues are issues still posting on Mturk server
- `process.json` contains all uncompleted issue's intermediate responses
- `reject_ids.json` contains the latest assignment ids that need to be rejected
- `approved.json` contains all rejected assignment ids

## Evaluating raw responses to get completed HITs
```
python mturk_util.py 1 e
```
evaluating using sandbox option, or
```
python mturk_util.py 2 e
```
evaluating using production option
### The rest of README will using sandbox option

## Approving all correct assignment ids to pay those workers
```
python mturk_util.py 1 a
```

## Rejecting all incorrect assignment ids
```
python mturk_util.py 1 r
```

## Getting account balance and simple statistics of all results
```
python mturk_util.py 1 s
```

## Overriding rejected assignment ids with approving
Make sure provide a json file that contains a json array of override assignment ids.
Suppose the file is called `override.json`.
```
python mturk_util.py 1 o override.json
```

## Getting labels
Labeling comment bodies in `/somedir/memoized_db` with the Mturk worker's responses and producing a `.csv` file to `review_data` directory.
```
python result_assembler.py /somedir/memoized_db
```

## Production run bash file
There is a bash file that runs on Mturk production server.

The bash code executes a cycle __C__ every 30 minutes for 5 times.

A cycle __C__ is _retrieving responses -> evaluating responses -> approving, rejecting assignment ids -> posting new HITs -> waiting for 10 minutes_.

```
sh production_run.sh /somedir/memoized_db
```
