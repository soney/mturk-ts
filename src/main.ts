import {MechanicalTurk} from './mturk_wrapper';
import {join} from 'path';

(async () => {
    const mturk = new MechanicalTurk();
    // await mturk.createHITFromFile(join(__dirname, '..', 'templates', 'AmazonExample.xml'), {
    //     Title: 'Test HIT over 5000',
    //     Description: 'Testing the HIT API',
    //     LifetimeInSeconds: 600,
    //     AssignmentDurationInSeconds: 600,
    //     Reward: '0.01',
    //     MaxAssignments: 4
    // });
    const hits = await mturk.listHITs({MaxResults: 10});
    hits.forEach(async (h) => {
        // console.log(h);
        const assignments = await h.listAssignments();
        assignments.forEach((a, i) => {
                a.getAnswers().forEach((v, k) => {
                    console.log(k);
                    console.log(v);
                });
            // console.log(h.getTitle());
        });
    });
})();
