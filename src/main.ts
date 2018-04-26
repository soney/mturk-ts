import {MechanicalTurk} from './mturk';
import {join} from 'path';
import _ = require('underscore');
import {listFiles} from 'list-files-in-dir';
import * as fs from 'fs';
import parse = require('xml-parser');

async function sleep(ms:number):Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface GitHubMessageTemplate {
  messages: Array<{
    comment_ID:string,
    body:string
  }>,
  messageTypes: Array<{
    name:string,
    description:string,
    example:string
  }>
};

interface HIT {
  issue_id: string,
  comments: GitHubMessageTemplate
};

interface Options {
  Title: string,
  Description: string,
  LifetimeInSeconds: number,
  AssignmentDurationInSeconds: number,
  Reward: string,
  MaxAssignments: number,
  QualificationRequirements?: Array<Qualification>
}

interface Qualification {
  QualificationTypeId: string,
  Comparator: string
}

const GHDiscussionTemplate:string = 'GithubDiscussionTemplate';
const RECORD_DATA_PATH:string = '/record_data'
const RAW_RESPONSES_PATH:string = '/raw_responses'
const PATH:string = '/Users/Xu/Desktop/gh_workspace/memoized_db';
const RATE:number = 0.02;
const TIME_PER_COMMENT_IN_SECONDS:number = 300;
const MAX_NUM_PENDING_HITS:number = 4;
const mturk = new MechanicalTurk();

function post_hits(data_path:string){
  let cwd:string = process.cwd();
  let posted_status = require(cwd + RECORD_DATA_PATH + '/no_post.json');
  let pending_list = posted_status['pending'];
  let completed_list = posted_status['completed']
  let bad_issue_ids = require(cwd + RECORD_DATA_PATH + '/bad_issue_ids.json');
  let new_posts_num = MAX_NUM_PENDING_HITS - pending_list.length;

  if (new_posts_num <= 0){
    console.log('The number of pending HITs is maximum: ' + MAX_NUM_PENDING_HITS);
    return;
  }
  // need to post at least one new HIT
  listFiles(data_path).then(files => {
    let new_HITs:HIT[] = [];
    let finished:boolean = false;
    for (let file in files){
      let issues = require(files[file]);
      for (let issue_id in issues){
        // issue_id which has not been posted yet
        if (pending_list.indexOf(issue_id) == -1 && completed_list.indexOf(issue_id) == -1 && bad_issue_ids.indexOf(issue_id) == -1){
          // decrement new_posts_num
          new_posts_num -= 1;
          let messages_list:GitHubMessageTemplate["messages"] = [];
          for (let comment in issues[issue_id]['issue_comments']) {
            messages_list.push({
              comment_ID: issue_id + '_' + issues[issue_id]['issue_comments'][comment]['comment_id'],
              body: _.escape(issues[issue_id]['issue_comments'][comment]['body'])
            });
          };

          let ghData:GitHubMessageTemplate = {
            messages: messages_list,
            messageTypes: _.shuffle([{
              name: 'Confirmation',
              description: 'If someone warrants the contribution, or agreement',
              example: 'This looks mostly good to me!'
            }, {
              name: 'Objection',
              description: 'When someone says something is wrong',
              example: 'This won\'t work, without a defined datatype'
            }, {
              name: 'Fixing',
              description: 'When someone says that they are working on fixing/resolving something',
              example: 'I\'m working on cleaning this up some more'
            }, {
              name: 'Suggestion',
              description: 'When someone makes a suggestion',
              example: 'Could you use camel case when you make future committs?'
            }, {
              name: 'Question',
              description: 'When someone asks a question',
              example: 'So should we commit this now or commit it later?'
            }, {
              name: 'Answer',
              description: 'When someone answers a question',
              example: 'Yes, the code does handle that case.'
            }, {
              name: 'Bug',
              description: 'When someone talks about a bug in the code',
              example: 'There\'s a flaw in the logic which was never noticed because it was never hit until now.'
            }, {
              name: 'Accept',
              description: 'When someone says they will merge or accept the code',
              example: 'Thanks, merged!'
            }, {
              name: 'Reject',
              description: 'When someone refuses to merge a request and is willing to close it',
              example: 'To be honest, I don\'t think this is something many people need so I\'ll go ahead and close this pull request. Thanks for contributing.'
            }, {
              name: 'Gratitude',
              description: 'When someone is thankful',
              example: 'Awesome, thanks!'
            }, {
              name: 'Apology',
              description: 'When someone feels sorry or apologizes',
              example: 'Oops, sorry. this should go into the code for version 2.0'
            }, {
              name: 'Mention',
              description: 'When someone mentions another user using the @ symbol',
              example: 'Hey @MichaelSmith could you fix this?'
            }, {
              name: 'Code',
              description: 'Primarily code in the message',
              example: `
              function add1(int x) {
                return x +1;
              }
              `
            }, {
              name: '+1 (Plus One)',
              description: 'Someone agrees by saying "+1"',
              example: '+1'
            }, {
              name: 'Digression',
              description: 'Someone deviates from the main topic and talks about something unrelated',
              example: 'Hey, check out this website...'
            }, {
              name: 'Non-english',
              description: 'This message is in a different language',
              example: 'なるほどー。プラグインを利用させてもらっている１ユーザーとして楽しみにしてます。 今回は自力でゴリゴリ変換して抜き出してみました。。。 参考になりました。ありがとうございました！'
            }, {
              name: 'Request',
              description: 'When someone requests/asks someone to do something',
              example: 'Could you add some functionality so that when the user clicks the button, the message disappears?'
            }, {
              name: 'URL',
              description: 'When main context of the comment is a URL',
              example: 'Refer https:\/\/google.com for more information'
            }])
          };

          let hit:HIT = {
            issue_id: issue_id,
            comments: ghData
          }
          new_HITs.push(hit);
        } else { // issue id is pending or completed
          continue;
        }

        if (new_posts_num == 0){
          finished = true;
          break;
        }
      }
      if (finished){
        break;
      }
    }
    const issueIdToQId = require(process.cwd() + RECORD_DATA_PATH + "/issue_qualification.json");
    (async () => {
      console.log(new_HITs);
      await mturk.processTemplateFile(GHDiscussionTemplate, 'GithubDiscussion.xml.dot');
      for (let idx = 0; idx != new_HITs.length; idx++){
        const len = new_HITs[idx].comments.messages.length;
        const duration = len * TIME_PER_COMMENT_IN_SECONDS;
        const lifetime = 1800;
        const reward = String(len * RATE);
        let ops:Options = {
          Title: 'GitHub Pull Requests',
          Description: 'You will be asked to read short messages and categorize them.',
          LifetimeInSeconds: lifetime,
          AssignmentDurationInSeconds: duration,
          Reward: reward,
          MaxAssignments: 4
        };
        if (new_HITs[idx].issue_id in issueIdToQId){
          ops.QualificationRequirements = [{
            QualificationTypeId: issueIdToQId[new_HITs[idx].issue_id]['q_id'],
            Comparator: "DoesNotExist"
          }];
        }
        try{
          await mturk.createHITFromTemplate(GHDiscussionTemplate, new_HITs[idx], ops);
        }
        catch (error){
          console.log("Caught an exception");
          console.log(error.message);
          console.log("---------------------------------------------------------------");
          if (error.message == 'Rate exceeded'){
            idx = idx - 1;
            await sleep(2000);
          } else if (error.message.indexOf('QualificationTypeId') >= 0){
            issueIdToQId[new_HITs[idx].issue_id]['valid'] = false;
          } else {
            console.log("Bad issue id " + new_HITs[idx].issue_id);
            bad_issue_ids.push(new_HITs[idx].issue_id);
            continue;
          }
        }
      }
      writeFile(process.cwd() + RECORD_DATA_PATH + "/bad_issue_ids.json", JSON.stringify(bad_issue_ids));
      writeFile(process.cwd() + RECORD_DATA_PATH + "/issue_qualification.json", JSON.stringify(issueIdToQId));
    })();
  });
}

function mapToJSON(map:Map<string, any>) {
  const result:any = {};
  map.forEach((value:any, key:string) => {
    result[key] = value;
  });
  return result;
}

function getResult(map:Map<string, {"pending":boolean, "responses":Map<string, {"response":Array<string>}>}>){
  const result:any = {};
  map.forEach((value, key) => {
    result[key] = {
      pending: value.pending,
      responses: mapToJSON(value.responses)
    }
  });
  return JSON.stringify(result);
}

function jsonToMap(jsonStr:string):Map<string, any> {
  const obj:any = JSON.parse(jsonStr);
  const rv:Map<string, any> = new Map<string, any>();
  for(let k of Object.keys(obj)) {
    rv.set(k, obj[k]);
  }
  return rv;
}

async function writeFile(filename:string, contents:string):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filename, contents, (err) => {
      if (err) {
        console.log(err);
        reject();
      }
      resolve();
    })
  });
};

function getQuestionIds(questionString:string):string[]{
  let questionIds:string[] = [];
  let pos:number = 0;
  while ((pos = questionString.indexOf('<QuestionIdentifier>', pos)) != -1){
    let startIdx = pos + '<QuestionIdentifier>'.length;
    let endIdx = questionString.indexOf('</QuestionIdentifier>', pos);
    questionIds.push(questionString.substring(startIdx, endIdx));
    pos += 1;
  }
  return questionIds;
}

function retrieve_results() {
  let HITs_status:Map<string, {
    "pending":boolean,
    "responses":Map<string,
    {
      "assignment_id":string,
      "response":Array<string>
    }>
  }> = new Map<string, {
    "pending":boolean,
    "responses":Map<string,
    {
      "assignment_id":string,
      "response":Array<string>
    }>
    }>();
  (async () => {
    const hits_result = await mturk.listHITs();
    const writePromises:Array<Promise<void>> = hits_result.map(async (h) => {
      const question_string = h.getQuestionString();
      const question_ids:string[] = getQuestionIds(question_string);
      question_ids.forEach((id) => {
        // get pending status
        if (!HITs_status.has(id)){
          if (h.getHITStatus() === 'Assignable'){
            HITs_status.set(id, {pending: true, responses: new Map<string, {"assignment_id":string, "response":Array<string>}>()});
          } else {
            HITs_status.set(id, {pending: false, responses: new Map<string, {"assignment_id":string, "response":Array<string>}>()});
          }
        } else {
          if (h.getHITStatus() === 'Assignable'){
            HITs_status.get(id).pending = true;
          }
        }
      });
      // if there are assignments, add to responses
      const assignments = await h.listAssignments();
      await assignments.forEach((a, i) => {
        a.getAnswers().forEach((v, k) => {
          let worker_id:string = a.getWorkerId();
          let response:Map<string, {"assignment_id":string, "response":Array<string>}> = HITs_status.get(k).responses;
          response.set(worker_id, {"assignment_id": a.getID(), "response": v});
        });
      });
    });
    await Promise.all(writePromises);
    let date:Date = new Date();
    let day:string = date.toLocaleDateString();
    let time:string = date.toLocaleTimeString();
    let dayTime:string = day + '-' + time;
    const path:string = process.cwd() + RAW_RESPONSES_PATH + '/result_' + dayTime + '.json';
    writeFile(path, getResult(HITs_status));
    console.log('all done writing');
  })();
}

if (process.argv.length < 3){
  console.log('Please provide mode, 1 for posting new HITs and 2 for retrieving responses');
  process.exit(1);
} else {
  const mode:string = process.argv[2];
  if (mode === '1'){
    if (process.argv.length < 4){
      console.log('Please provide the directory that contains ghtorrent processed json files');
      process.exit(1);
    }
    const data_path:string = process.argv[3];
    post_hits(data_path);
  } else if (mode === '2'){
    retrieve_results();
  } else {
    console.log('Please provide mode, 1 for posting new HITs and 2 for retrieving responses');
    process.exit(1);
  }
}
