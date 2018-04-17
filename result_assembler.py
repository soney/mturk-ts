import os
import json
import csv

class ResultAssembler:
    RECORD_PATH = 'record_data'
    REVIEW_PATH = 'review_data'
    COMPLETED = os.path.join(RECORD_PATH, 'completed.json')
    LABELS = os.path.join(RECORD_PATH, 'labels.json')
    REVIEW_CSV = os.path.join(REVIEW_PATH, 'labels.csv')
    FIELD_NAMES = ['issue_id', 'comment_id', 'comment', 'labels', 'reviewed']

    def __init__(self, data_dir):
        self.data_dir = data_dir

        with open(self.COMPLETED, 'r') as f:
            self.completed = json.load(f)

        with open(self.LABELS, 'r') as f:
            self.labels = json.load(f)

    def get_labels(self):
        for issue_id in self.completed:
            if not issue_id in self.labels:
                self.labels[issue_id] = {}
                for comment_id in self.completed[issue_id]:
                    self.labels[issue_id][comment_id] = []
                    labels = self.completed[issue_id][comment_id]
                    for label in labels:
                        if len(labels[label]) >= 2:
                            self.labels[issue_id][comment_id].append(label)

        with open(self.LABELS, 'w') as f:
            f.write(json.dumps(self.labels))

    def get_comment_and_labels(self):
        recorded_issue_ids = set()
        need_header = False
        with open(self.REVIEW_CSV, 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                issue_id = row[self.FIELD_NAMES[0]]
                if issue_id not in recorded_issue_ids:
                    recorded_issue_ids.add(issue_id)
        if os.stat(self.REVIEW_CSV).st_size == 0:
            need_header = True

        data_files = os.listdir(self.data_dir)
        new_rows = []
        for data_file in data_files:
            data_file_path = os.path.join(self.data_dir, data_file)
            with open(data_file_path, 'r') as f:
                data_dict = json.load(f)

            for issue_id in self.labels:
                if issue_id in data_dict and issue_id not in recorded_issue_ids:
                    for comment_id in self.labels[issue_id]:
                        row_dict = {self.FIELD_NAMES[0]: issue_id,
                                    self.FIELD_NAMES[1]: comment_id,
                                    self.FIELD_NAMES[3]: self.labels[issue_id][comment_id],
                                    self.FIELD_NAMES[4]: False}
                        issue_comments = data_dict[issue_id]['issue_comments']
                        for comment in issue_comments:
                            if comment_id == comment['comment_id']:
                                row_dict[self.FIELD_NAMES[2]] = comment['body']
                        new_rows.append(row_dict)

        sorted(new_rows, key=lambda row: int(row['issue_id']))
        print(new_rows)
        with open(self.REVIEW_CSV, 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=self.FIELD_NAMES)
            if need_header:
                writer.writeheader()

            for row in new_rows:
                writer.writerow(row)

if __name__ == '__main__':
    assembler = ResultAssembler('/Users/Xu/Desktop/gh_workspace/memoized_db')
    assembler.get_labels()
    assembler.get_comment_and_labels()