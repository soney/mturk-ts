"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var mturk_1 = require("./mturk");
var _ = require("underscore");
;
var ghData = {
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
            example: "\n        function add1(int x) {\n            return x +1;\n        }\n        "
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
var GHDiscussionTemplate = 'GithubDiscussionTemplate';
(function () { return __awaiter(_this, void 0, void 0, function () {
    var mturk;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mturk = new mturk_1.MechanicalTurk();
                return [4 /*yield*/, mturk.processTemplateFile(GHDiscussionTemplate, 'GithubDiscussion.xml.dot')];
            case 1:
                _a.sent();
                return [4 /*yield*/, mturk.createHITFromTemplate(GHDiscussionTemplate, ghData, {
                        Title: 'Test HIT over 5000',
                        Description: 'Testing the HIT API',
                        LifetimeInSeconds: 600,
                        AssignmentDurationInSeconds: 600,
                        Reward: '0.01',
                        MaxAssignments: 4
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=main.js.map