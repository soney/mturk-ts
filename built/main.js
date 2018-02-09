"use strict";
exports.__esModule = true;
var mturk = require("mturk-api");
var _ = require("underscore");
var fs_1 = require("fs");
var path_1 = require("path");
var MTURK_CONFIG = {
    access: 'AKIAJCWMFJPWOIPQKRBA',
    secret: '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',
    sandbox: true
};
var clientPromise = mturk.createClient(MTURK_CONFIG);
clientPromise.then(function (api) {
    getFileContents(path_1.join(__dirname, '..', 'templates', 'HTMLQuestion.xml')).then(function (fileContents) {
        api.req('CreateHIT', {
            'Title': 'Test HIT',
            'Description': 'Testing 123',
            'AssignmentDurationInSeconds': 60,
            'LifetimeInSeconds': 60,
            'Reward': { CurrencyCode: 'USD', Amount: 0.01 },
            'Question': _.escape(fileContents)
        }).then(function (res) {
            console.log(res);
            api.req('SearchHITs', { 'PageSize': 1 }).then(function (res) {
                console.log(res);
                console.log(res.SearchHITsResult);
            });
        })["catch"](console.error);
    });
});
function getFileContents(fileName) {
    return new Promise(function (resolve, reject) {
        fs_1.readFile(fileName, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
;
//# sourceMappingURL=main.js.map