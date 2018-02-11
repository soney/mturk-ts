import * as _ from 'underscore';
import * as fs from 'fs';
import {join} from 'path';
import AWS = require('aws-sdk');
import MTurk = require('aws-sdk/clients/mturk');
import parse = require('xml-parser');

const REGION:string = 'us-east-1';
const PRODUCTION:string = 'https://mturk-requester.us-east-1.amazonaws.com';
const SANDBOX:string = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com';
const API_VERSION:string = '2017-01-17';


export class MechanicalTurkHIT {
    constructor(private mturk:MechanicalTurk, private info:MTurk.HIT) {
    };
    private setInfo(info:MTurk.HIT) {
        this.info = info;
    }
    public getID():string { return this.info.HITId; };
    public getTitle():string { return this.info.Title; };

    public async delete():Promise<void> {
        return this.mturk.deleteHIT({HITId: this.getID()});
    };
    public async refresh():Promise<void> {
        this.info = await this.mturk.getRawHIT({HITId: this.getID()});
    };
    public async listAssignments():Promise<Array<MechanicalTurkAssignment>> {
        const rawAssignments = await this.mturk.listRawAssignmentsForHIT({HITId: this.getID()});
        return rawAssignments.map((assignment:MTurk.Assignment) => new MechanicalTurkAssignment(this.mturk, this, assignment));
    };
    public toString():string {
        return `HIT ${this.getID()}`;
    };
};
export class MechanicalTurkAssignment {
    constructor(private mturk:MechanicalTurk, private hit:MechanicalTurkHIT, private info:MTurk.Assignment) {
    };
    public getID():string { return this.info.AssignmentId; };
    public getWorkerID():string { return this.info.WorkerId; };
    public getStatus():string { return this.info.AssignmentStatus; };
    public getAnswerString():string { return this.info.Answer; };
    public async approve(OverrideRejection:boolean = false, RequesterFeedback:string = ''):Promise<void> {
        await this.mturk.approveAssignment({ AssignmentId: this.getID(), OverrideRejection, RequesterFeedback });
    };
    public async reject(RequesterFeedback:string):Promise<void> {
        await this.mturk.approveAssignment({ AssignmentId: this.getID(), RequesterFeedback });
    };
    public getAnswers():Map<string, string> {
        const data = parse(this.getAnswerString());
        const {root} = data;
        const result:Map<string, string> = new Map<string, string>();
        root.children.forEach((child) => {
            const {name} = child;
            if(name === 'Answer') {
                const {children} = child;
                let identifier:string;
                let value:string;
                children.forEach((c) => {
                    const {name, content} = c;
                    if(name === 'QuestionIdentifier') {
                        identifier = content;
                    } else {
                        value = content;
                    }
                });
                if(identifier && value) {
                    result.set(identifier, value);
                }
            }
        });
        return result;
    };
};

export class MechanicalTurk {
    private mturk:Promise<MTurk>;
    constructor(configFileName:string=join(__dirname, '..', 'mturk_creds.json')) {
        this.mturk = this.loadConfigFile(configFileName).then((config) => {
            return new MTurk({
                region: REGION,
                endpoint: config.sandbox ? SANDBOX : PRODUCTION,
                accessKeyId: config.access,
                secretAccessKey: config.secret,
                apiVersion: API_VERSION
            });
        }, (err) => {
            throw new Error(`Could not read config file ${configFileName}. See mturk_creds.sample.json for an example format`);
        });
    };
    private loadConfigFile(fileName:string):Promise<{sandbox?:boolean, access:string, secret:string}> {
        return fileExists(fileName).then((exists:boolean) => {
            if(exists) {
                return getFileContents(fileName);
            } else {
                throw new Error(`Could not find config file ${fileName}.`);
            }
        }).then((contents:string) => {
            return JSON.parse(contents);
        });
    };
    public async getAccountBalance():Promise<number> {
        const mturk:MTurk = await this.mturk;
        return new Promise<number>((resolve, reject) => {
            mturk.getAccountBalance({}, (err, data) => {
                if(err) { reject(err); }
                else { resolve(parseFloat(data.AvailableBalance)); }
            });
        });
    };

    public async createHIT(options:MTurk.CreateHITRequest):Promise<MechanicalTurkHIT> {
        const mturk:MTurk = await this.mturk;
        return new Promise<MechanicalTurkHIT>((resolve, reject) => {
            mturk.createHIT(options, (err, data) => {
                if(err) { reject(err); }
                else {
                    resolve(new MechanicalTurkHIT(this, data.HIT));
                }
            });
        });
    };
    public async createHITFromFile(questionFileName:string, options:MTurk.CreateHITRequest) {
        const questionContents = await getFileContents(questionFileName);
        return this.createHIT(_.extend({}, options, {Question: questionContents}));
    };
    public async getRawHIT(options:MTurk.GetHITRequest):Promise<MTurk.HIT> {
        const mturk:MTurk = await this.mturk;
        return new Promise<MTurk.HIT>((resolve, reject) => {
            mturk.getHIT(options, (err, data) => {
                if(err) { reject(err); }
                else {
                    resolve(data.HIT);
                }
            });
        });
    };

    private async getHIT(options:MTurk.GetHITRequest):Promise<MechanicalTurkHIT> {
        const HITResult = await this.getRawHIT(options);
        return new MechanicalTurkHIT(this, HITResult);
    };

    public async deleteHIT(options:MTurk.DeleteHITRequest):Promise<void> {
        const mturk:MTurk = await this.mturk;
        await new Promise<MTurk.DeleteHITResponse>((resolve, reject) => {
            mturk.deleteHIT(options, (err, data) => {
                if(err) { reject(err); }
                else { resolve(data); }
            });
        });
    };

    public async listHITs(options:MTurk.ListHITsRequest={}):Promise<Array<MechanicalTurkHIT>> {
        const mturk:MTurk = await this.mturk;
        return new Promise<Array<MechanicalTurkHIT>>((resolve, reject) => {
            mturk.listHITs(options, (err, data) => {
                if(err) { reject(err); }
                else {
                    resolve(data.HITs.map((hit:MTurk.HIT) => new MechanicalTurkHIT(this, hit)));
                }
            });
        });
    };

    public async listRawAssignmentsForHIT(options:MTurk.ListAssignmentsForHITRequest):Promise<Array<MTurk.HIT>> {
        const mturk:MTurk = await this.mturk;
        return new Promise<Array<MTurk.HIT>>((resolve, reject) => {
            mturk.listAssignmentsForHIT(options, (err, data) => {
                if(err) { reject(err); }
                else { resolve(data.Assignments); }
            });
        });
    };
    public async approveAssignment(params:MTurk.ApproveAssignmentRequest):Promise<MTurk.ApproveAssignmentResponse> {
        const mturk:MTurk = await this.mturk;
        return new Promise<MTurk.ApproveAssignmentResponse>((resolve, reject) => {
            mturk.approveAssignment(params, (err, data) => {
                if(err) { reject(err); }
                else { resolve(data); }
            });
        });
    };
    public async rejectAssignment(params:MTurk.RejectAssignmentRequest):Promise<MTurk.RejectAssignmentResponse> {
        const mturk:MTurk = await this.mturk;
        return new Promise<MTurk.RejectAssignmentResponse>((resolve, reject) => {
            mturk.rejectAssignment(params, (err, data) => {
                if(err) { reject(err); }
                else { resolve(data); }
            });
        });
    };
};

function fileExists(fileName:string):Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.access(fileName, fs.R_OK, (err) => {
            if(err) { resolve(false); }
            else { resolve(true); }
        });
    });
}

function getFileContents(fileName:string):Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
            if(err) { reject(err); }
            else { resolve(data); }
        });
    });
};
