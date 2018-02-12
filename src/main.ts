import {MechanicalTurk} from './mturk';
import {join} from 'path';
import _ = require('underscore');

interface GitHubMessageTemplate {
    messages: Array<{
        identifier:string,
        displayName:string,
        text:string
    }>,
    messageTypes: Array<{
        name:string,
        description:string,
        example:string
    }>
};

const ghData:GitHubMessageTemplate = {
    messages: [{
        identifier: 'm1',
        displayName: 'message1',
        text: 'This is the first message'
    }, {
        identifier: 'm2',
        displayName: 'message2',
        text: 'This is the second message'
    }],
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
        example: 'To be honest, I don\'t this this is something many people need so I\'ll go ahead and close this pull request. Thanks for contributing.'
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
        description: 'When someone mentions another user',
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
    }])
};
const GHDiscussionTemplate:string = 'GithubDiscussionTemplate';

(async () => {
    const mturk = new MechanicalTurk();
    await mturk.processTemplateFile(GHDiscussionTemplate, 'GithubDiscussion.xml.dot');
    await mturk.createHITFromTemplate(GHDiscussionTemplate, ghData, {
        Title: 'Test HIT over 5000',
        Description: 'Testing the HIT API',
        LifetimeInSeconds: 600,
        AssignmentDurationInSeconds: 600,
        Reward: '0.01',
        MaxAssignments: 4
    });
    // await mturk.createHITFromFile(join(__dirname, '..', 'templates', 'AmazonExample.xml'), {
    //     Title: 'Test HIT over 5000',
    //     Description: 'Testing the HIT API',
    //     LifetimeInSeconds: 600,
    //     AssignmentDurationInSeconds: 600,
    //     Reward: '0.01',
    //     MaxAssignments: 4
    // });
    // const hits = await mturk.listHITs({MaxResults: 10});
    // hits.forEach(async (h) => {
    //     // console.log(h);
    //     const assignments = await h.listAssignments();
    //     assignments.forEach((a, i) => {
    //             a.getAnswers().forEach((v, k) => {
    //                 console.log(k);
    //                 console.log(v);
    //             });
    //         // console.log(h.getTitle());
    //     });
    // });
})();
