import {MechanicalTurk} from './mturk_wrapper';
import {join} from 'path';
import {readFile} from 'fs';
import * as _ from 'underscore';

const mturk = new MechanicalTurk();
mturk.getAccountBalance().then((balance) => {
    console.log(balance);
});
getFileContents(join(__dirname, '..', 'templates', 'HTMLQuestion.xml')).then(async (fileContents) => {
    // const x = await mturk.createHIT('THIS IS A TITLE', 'THIS IS A DESCRIPTION', 60, 60, 0.01, _.escape(fileContents));
    // console.log(x.toString());
    const y = await mturk.searchHITs(20);
    let h = y[0];
    h.listAssignments();
    // y.forEach((h) => {
    //     console.log(h.listAssignments());
    // })
    // console.log(y);

    // console.log(y.SearchHITsResult[0].HIT);
});
// import * as mturk from 'mturk-api';
// import * as _ from 'underscore';
// import {readFile} from 'fs';
// import {join} from 'path';
//
// const MTURK_CONFIG = {
//     access : 'AKIAJCWMFJPWOIPQKRBA',
//     secret : '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',
//     sandbox: true
// };
//
// const clientPromise = mturk.createClient(MTURK_CONFIG);
//
// clientPromise.then((api) => {
//     getFileContents(join(__dirname, '..', 'templates', 'HTMLQuestion.xml')).then((fileContents) => {
//         api.req('CreateHIT', {
//             'Title': 'Test HIT',
//             'Description': 'Testing 123',
//             'AssignmentDurationInSeconds': 60,
//             'LifetimeInSeconds': 60,
//             'Reward': {CurrencyCode:'USD', Amount:0.01},
//             'Question': _.escape(fileContents)
//         }).then((res) => {
//             // console.log(res.HIT[0].Request);
//             // api.req('SearchHITs', {'PageSize': 1}).then((res) => {
//             //     console.log(res);
//             //     console.log(res.SearchHITsResult);
//             // });
//         }).catch(console.error);
//     });
// });
//
function getFileContents(fileName:string):Promise<string> {
    return new Promise<string>((resolve, reject) => {
        readFile(fileName, 'utf8', (err, data) => {
            if(err) { reject(err); }
            else { resolve(data); }
        });
    });
};
