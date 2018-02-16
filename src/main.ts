import {MechanicalTurk} from './mturk';
import {join} from 'path';
import _ = require('underscore');

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

var data = require("../data.json");

const hits = []
for (let i_id in data) {
  var messages_list:GitHubMessageTemplate["messages"] = [];
  for (let comment in data[i_id]['issue_comments']) {
    messages_list.push({
      comment_ID: data[i_id]['issue_comments'][comment]['comment_id'],
      body: data[i_id]['issue_comments'][comment]['body']
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

const GHDiscussionTemplate:string = 'GithubDiscussionTemplate';

(async () => {
  for (let hit in hits) {
    const mturk = new MechanicalTurk();
    await mturk.processTemplateFile(GHDiscussionTemplate, 'GithubDiscussion.xml.dot');
    var lifetime = hits[hit].comments.messages.length * 300;
    lifetime = 300;
    var reward = String(hits[hit].comments.messages.length * 0.02);
    await mturk.createHITFromTemplate(GHDiscussionTemplate, hits[hit], {
        Title: 'GitHub Pull Requests',
        Description: 'You will be asked to read short messages and categorize them.',
        LifetimeInSeconds: lifetime,
        AssignmentDurationInSeconds: lifetime,
        Reward: reward,
        MaxAssignments: 4
    });


    // const hits = await mturk.listHITs({MaxResults: 10});
    // hits.forEach(async (h) => {
    //     const assignments = await h.listAssignments();
    //     assignments.forEach((a, i) => {
    //         a.getAnswers().forEach((v, k) => {
    //             console.log('Question', k);
    //             console.log('Answer', v);
    //         });
    //     });
    // });
  }
})();
