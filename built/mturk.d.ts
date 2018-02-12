import MTurk = require('aws-sdk/clients/mturk');
import dot = require('dot');
export declare class MechanicalTurkWorkerGroup {
    private mturk;
    private workers;
    constructor(mturk: MechanicalTurk, workers: Set<MechanicalTurkWorker>);
    add(worker: MechanicalTurkWorker): void;
    remove(worker: MechanicalTurkWorker): void;
    clear(): void;
    has(worker: MechanicalTurkWorker): boolean;
    notify(Subject: string, MessageText: string): Promise<void>;
}
export declare class MechanicalTurkWorker {
    private mturk;
    private workerId;
    constructor(mturk: MechanicalTurk, workerId: string);
    getID(): string;
    createBlock(Reason: string): Promise<void>;
    deleteBlock(Reason?: string): Promise<void>;
    notify(Subject: string, MessageText: string): Promise<void>;
}
export declare class MechanicalTurkHIT {
    private mturk;
    private info;
    constructor(mturk: MechanicalTurk, info: MTurk.HIT);
    setInfo(info: MTurk.HIT): void;
    getID(): string;
    getTitle(): string;
    delete(): Promise<void>;
    refresh(): Promise<void>;
    listAssignments(): Promise<Array<MechanicalTurkAssignment>>;
    updateExpiration(ExpireAt: Date): Promise<void>;
    updateReviewStatus(Revert?: boolean): Promise<void>;
    toString(): string;
}
export declare class MechanicalTurkAssignment {
    private mturk;
    private hit;
    private info;
    constructor(mturk: MechanicalTurk, hit: MechanicalTurkHIT, info: MTurk.Assignment);
    getID(): string;
    getWorker(): MechanicalTurkWorker;
    getStatus(): string;
    getAnswerString(): string;
    approve(OverrideRejection?: boolean, RequesterFeedback?: string): Promise<void>;
    reject(RequesterFeedback: string): Promise<void>;
    getAnswers(): Map<string, string>;
}
export interface MechanicalTurkOptions {
    configFileName: string;
    templateDirectory: string;
}
export declare class MechanicalTurk {
    private mturk;
    private templates;
    private hitCache;
    private assignmentCache;
    private workerCache;
    private options;
    private static DEFAULT_OPTIONS;
    constructor(options?: MechanicalTurkOptions);
    registerTemplate(name: string, templateString: string, templateSettings?: dot.TemplateSettings): void;
    processTemplateFile(name: string, path: string, templateSettings?: dot.TemplateSettings): Promise<void>;
    createHITFromTemplate(templateName: string, templateArguments: {}, options: MTurk.CreateHITRequest): Promise<MechanicalTurkHIT>;
    createMechanicalTurkHIT(info: MTurk.HIT): MechanicalTurkHIT;
    createMechanicalTurkAssignment(hit: MechanicalTurkHIT, info: MTurk.Assignment): MechanicalTurkAssignment;
    createMechanicalTurkWorker(WorkerID: string): MechanicalTurkWorker;
    private loadConfigFile(fileName);
    getAccountBalance(): Promise<number>;
    createHIT(options: MTurk.CreateHITRequest): Promise<MechanicalTurkHIT>;
    createHITFromFile(questionFileName: string, options: MTurk.CreateHITRequest): Promise<MechanicalTurkHIT>;
    getRawHIT(options: MTurk.GetHITRequest): Promise<MTurk.HIT>;
    private getHIT(options);
    deleteHIT(options: MTurk.DeleteHITRequest): Promise<void>;
    listHITs(options?: MTurk.ListHITsRequest): Promise<Array<MechanicalTurkHIT>>;
    listRawAssignmentsForHIT(options: MTurk.ListAssignmentsForHITRequest): Promise<Array<MTurk.HIT>>;
    approveAssignment(params: MTurk.ApproveAssignmentRequest): Promise<MTurk.ApproveAssignmentResponse>;
    rejectAssignment(params: MTurk.RejectAssignmentRequest): Promise<MTurk.RejectAssignmentResponse>;
    updateExpirationForHIT(params: MTurk.UpdateExpirationForHITRequest): Promise<MTurk.UpdateExpirationForHITResponse>;
    updateHITReviewStatus(params: MTurk.UpdateHITReviewStatusRequest): Promise<MTurk.UpdateHITReviewStatusResponse>;
    createWorkerBlock(params: MTurk.CreateWorkerBlockRequest): Promise<MTurk.CreateWorkerBlockResponse>;
    deleteWorkerBlock(params: MTurk.DeleteWorkerBlockRequest): Promise<MTurk.DeleteWorkerBlockResponse>;
    notifyWorkers(params: MTurk.NotifyWorkersRequest): Promise<MTurk.NotifyWorkersResponse>;
}
