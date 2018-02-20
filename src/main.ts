import {MechanicalTurk} from './mturk';
import {join} from 'path';
import _ = require('underscore');
import {listFiles} from 'list-files-in-dir';

function sleep(ms:number) {
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

const GHDiscussionTemplate:string = 'GithubDiscussionTemplate';
const RATE:number = 0.02;
const TIME_PER_COMMENT_IN_SECONDS:number = 300;
const mturk = new MechanicalTurk();

const PATH = '/Users/vanditagarwal/Downloads/SI_Soney/gh_mining/memoized_db';

listFiles(PATH)
.then(files => {
  for (let file in files) {
    var data = require(files[file]);
    let hits = []
    for (let i_id in data) {
      var messages_list:GitHubMessageTemplate["messages"] = [];
      for (let comment in data[i_id]['issue_comments']) {
        messages_list.push({
          comment_ID: i_id + '_' + data[i_id]['issue_comments'][comment]['comment_id'],
          body: _.escape(data[i_id]['issue_comments'][comment]['body'])
        });
      };
      var ghData:GitHubMessageTemplate = {
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
      var hit:HIT = {
        issue_id: i_id,
        comments: ghData
      };
      hits.push(hit);
    };

    (async () => {
      // await mturk.processTemplateFile(GHDiscussionTemplate, 'GithubDiscussion.xml.dot');
      // for (var idx=0; idx!= hits.length; idx++){
      //   var len = hits[idx].comments.messages.length;
      //   var duration = len * TIME_PER_COMMENT_IN_SECONDS;
      //   var lifetime = 600;
      //   var reward = String(len * RATE);
      //   try{
      //     await mturk.createHITFromTemplate(GHDiscussionTemplate, hits[idx], {
      //       Title: 'GitHub Pull Requests',
      //       Description: 'You will be asked to read short messages and categorize them.',
      //       LifetimeInSeconds: lifetime,
      //       AssignmentDurationInSeconds: duration,
      //       Reward: reward,
      //       MaxAssignments: 2
      //     });
      //   }
      //   catch (error){
      //     console.log("Caught an exception");
      //     console.log(error.message);
      //     if (error.message == 'Rate exceeded'){
      //       idx = idx-1;
      //       await sleep(2000);
      //     };
      //   }
      // }

      const hits_result = await mturk.listHITs({MaxResults: 10});
      hits_result.forEach(async (h) => {
          const assignments = await h.listAssignments();
          assignments.forEach((a, i) => {
              a.getAnswers().forEach((v, k) => {
                  console.log('Question: ', k);
                  console.log('Answer: ', v, "\n");
              });
          });
      });
    })();
    break;
  };
});
