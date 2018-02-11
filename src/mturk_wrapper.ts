import * as mturk from 'mturk-api';
import * as _ from 'underscore';
import * as fs from 'fs';
import {join} from 'path';

export interface MechanicalTurkOptions {
    currencyCode:mturk.API.CurrencyCode
};

export class MechanicalTurkHIT {
    constructor(private mturk:MechanicalTurk, private info:mturk.API.HIT) {
    };
    private setInfO(info:mturk.API.HIT) {
        this.info = info;
    }
    private getID():mturk.API.HITID { return this.info.HITId; }
    public async disable():Promise<boolean> {
        return this.mturk.disableHIT(this.getID());
    };
    public async dispose():Promise<boolean> {
        return this.mturk.disposeHIT(this.getID());
    };
    public async listAssignments() {
        return this.mturk.disposeHIT(this.getID());
    };
    public async setHITAsReviewing() {
        return this.mturk.setHITAsReviewing(this.getID());
    };
    public getReviewStatus():mturk.API.HITReviewStatus {
        return this.info.HITReviewStatus;
    };
    public toString():string {
        return `HIT ${this.getID()}`;
    };
    public async refresh():Promise<void> {
        this.info = await this.mturk.getRawHIT(this.getID());
    };
};

export class MechanicalTurk {
    private static defaultOptions:MechanicalTurkOptions = {
        currencyCode: 'USD'
    };
    private mturkAPI:mturk.API;
    private readyPromise:Promise<this>;
    private options:MechanicalTurkOptions;
    constructor(options?:MechanicalTurkOptions, configFileName:string=join(__dirname, '..', 'mturk_creds.json')) {
        this.options = _.extend({}, MechanicalTurk.defaultOptions, options);
        this.readyPromise = this.loadConfigFile(configFileName).then((config:mturk.Config) => {
            return mturk.createClient(config);
        }).catch((err) => {
            throw new Error(`Could not read config file ${configFileName}. See mturk_creds.sample.json for an example format`);
        }).then((mturkAPI:mturk.API) => {
            this.mturkAPI = mturkAPI;
            return this;
        }, (err) => {
            console.error(err);
            throw(err);
        });
    };
    private loadConfigFile(fileName:string):Promise<mturk.Config> {
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
    public async ready():Promise<this> {
        return this.readyPromise;
    };
    public async getAccountBalance():Promise<number> {
        await this.ready();
        return this.mturkAPI.req('GetAccountBalance').then((result) => {
            const firstResult = result.GetAccountBalanceResult[0];
            const {AvailableBalance} = firstResult;
            if(AvailableBalance.CurrencyCode === this.options.currencyCode) {
                return parseFloat(AvailableBalance.Amount);
            } else {
                throw new Error(`Result currency code (${AvailableBalance.CurrencyCode}) does not mach specified option currency code ${this.options.currencyCode}`);
            }
        });
    };
    public async createHIT(title:string, description:string, durationInSeconds:number, lifetimeInSeconds:number, rewardAmount:number, question:string):Promise<MechanicalTurkHIT> {
        await this.ready();
        const options:mturk.API.CreateHITParams = {
            Title: title,
            Description: description,
            AssignmentDurationInSeconds: durationInSeconds,
            LifetimeInSeconds: lifetimeInSeconds,
            Reward: { CurrencyCode: this.options.currencyCode, Amount: rewardAmount },
            Question: question
        };
        return this.mturkAPI.req('CreateHIT', options).then((result) => {
            const HITResult = result.HIT[0];
            return this.getHIT(HITResult.HITId);
        });
    };
    public async getRawHIT(HITId:mturk.API.HITID):Promise<mturk.API.HIT> {
        await this.ready();
        return this.mturkAPI.req('GetHIT', {HITId}).then((result) => {
            return result.HIT[0];
        });
    };
    private async getHIT(HITId:mturk.API.HITID):Promise<MechanicalTurkHIT> {
        const HITResult = await this.getRawHIT(HITId);
        return new MechanicalTurkHIT(this, HITResult);
    };
    public async disposeHIT(HITId:mturk.API.HITID):Promise<boolean> {
        await this.ready();
        return this.mturkAPI.req('DisposeHIT', {HITId}).then((result) => {
            return true;
        });
    };
    public async disableHIT(HITId:mturk.API.HITID):Promise<boolean> {
        await this.ready();
        return this.mturkAPI.req('DisableHIT', {HITId}).then((result) => {
            return true;
        });
    };
    public async setHITAsReviewing(HITId:mturk.API.HITID):Promise<void> {
        await this.ready();
        await this.mturkAPI.req('SetHITAsReviewing', {HITId});
    };
    public async listAssignments(HITId:mturk.API.HITID) {
        await this.ready();
        return this.mturkAPI.req('ListAssignmentsForHIT', {HITId}).then((result) => {
            console.log(result);
            return true;
        });
    };
    public async searchHITs(PageSize:number=1):Promise<Array<MechanicalTurkHIT>> {
        await this.ready();
        return this.mturkAPI.req('SearchHITs', {PageSize}).then((result) => {
            const searchHITsResult = result.SearchHITsResult[0];
            if(searchHITsResult.NumResults === 0) {
                return [];
            } else {
                return searchHITsResult.HIT.map((hit:mturk.API.HIT) => {
                    return new MechanicalTurkHIT(this, hit);
                });
            }
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
