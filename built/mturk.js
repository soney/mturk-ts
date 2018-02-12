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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var fs = require("fs");
var path_1 = require("path");
var MTurk = require("aws-sdk/clients/mturk");
var parse = require("xml-parser");
var dot = require("dot");
var PRODUCTION = 'https://mturk-requester.us-east-1.amazonaws.com';
var SANDBOX = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com';
var REGION = 'us-east-1';
var API_VERSION = '2017-01-17';
var MechanicalTurkWorkerGroup = /** @class */ (function () {
    function MechanicalTurkWorkerGroup(mturk, workers) {
        this.mturk = mturk;
        this.workers = workers;
    }
    ;
    MechanicalTurkWorkerGroup.prototype.add = function (worker) {
        this.workers.add(worker);
    };
    ;
    MechanicalTurkWorkerGroup.prototype.remove = function (worker) {
        this.workers.delete(worker);
    };
    ;
    MechanicalTurkWorkerGroup.prototype.clear = function () {
        this.workers.clear();
    };
    ;
    MechanicalTurkWorkerGroup.prototype.has = function (worker) {
        return this.workers.has(worker);
    };
    ;
    MechanicalTurkWorkerGroup.prototype.notify = function (Subject, MessageText) {
        return __awaiter(this, void 0, void 0, function () {
            var WorkerIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        WorkerIds = Array.from(this.workers.values()).map(function (w) { return w.getID(); });
                        return [4 /*yield*/, this.mturk.notifyWorkers({ WorkerIds: WorkerIds, Subject: Subject, MessageText: MessageText })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return MechanicalTurkWorkerGroup;
}());
exports.MechanicalTurkWorkerGroup = MechanicalTurkWorkerGroup;
;
var MechanicalTurkWorker = /** @class */ (function () {
    function MechanicalTurkWorker(mturk, workerId) {
        this.mturk = mturk;
        this.workerId = workerId;
    }
    ;
    MechanicalTurkWorker.prototype.getID = function () {
        return this.workerId;
    };
    ;
    MechanicalTurkWorker.prototype.createBlock = function (Reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.createWorkerBlock({ WorkerId: this.getID(), Reason: Reason })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkWorker.prototype.deleteBlock = function (Reason) {
        if (Reason === void 0) { Reason = ''; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.deleteWorkerBlock({ WorkerId: this.getID(), Reason: Reason })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkWorker.prototype.notify = function (Subject, MessageText) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.notifyWorkers({ WorkerIds: [this.getID()], Subject: Subject, MessageText: MessageText })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return MechanicalTurkWorker;
}());
exports.MechanicalTurkWorker = MechanicalTurkWorker;
;
var MechanicalTurkHIT = /** @class */ (function () {
    function MechanicalTurkHIT(mturk, info) {
        this.mturk = mturk;
        this.info = info;
    }
    ;
    MechanicalTurkHIT.prototype.setInfo = function (info) {
        this.info = info;
    };
    ;
    MechanicalTurkHIT.prototype.getID = function () { return this.info.HITId; };
    ;
    MechanicalTurkHIT.prototype.getTitle = function () { return this.info.Title; };
    ;
    MechanicalTurkHIT.prototype.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.mturk.deleteHIT({ HITId: this.getID() })];
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.getRawHIT({ HITId: this.getID() })];
                    case 1:
                        info = _a.sent();
                        this.setInfo(info);
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.listAssignments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var rawAssignments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.listRawAssignmentsForHIT({ HITId: this.getID() })];
                    case 1:
                        rawAssignments = _a.sent();
                        return [2 /*return*/, rawAssignments.map(function (assignment) { return _this.mturk.createMechanicalTurkAssignment(_this, assignment); })];
                }
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.updateExpiration = function (ExpireAt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.updateExpirationForHIT({ HITId: this.getID(), ExpireAt: ExpireAt })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.updateReviewStatus = function (Revert) {
        if (Revert === void 0) { Revert = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.updateHITReviewStatus({ HITId: this.getID(), Revert: Revert })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.toString = function () {
        return "HIT " + this.getID();
    };
    ;
    return MechanicalTurkHIT;
}());
exports.MechanicalTurkHIT = MechanicalTurkHIT;
;
var MechanicalTurkAssignment = /** @class */ (function () {
    function MechanicalTurkAssignment(mturk, hit, info) {
        this.mturk = mturk;
        this.hit = hit;
        this.info = info;
    }
    ;
    MechanicalTurkAssignment.prototype.getID = function () { return this.info.AssignmentId; };
    ;
    MechanicalTurkAssignment.prototype.getWorker = function () {
        return this.mturk.createMechanicalTurkWorker(this.info.WorkerId);
    };
    ;
    MechanicalTurkAssignment.prototype.getStatus = function () { return this.info.AssignmentStatus; };
    ;
    MechanicalTurkAssignment.prototype.getAnswerString = function () { return this.info.Answer; };
    ;
    MechanicalTurkAssignment.prototype.approve = function (OverrideRejection, RequesterFeedback) {
        if (OverrideRejection === void 0) { OverrideRejection = false; }
        if (RequesterFeedback === void 0) { RequesterFeedback = ''; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.approveAssignment({ AssignmentId: this.getID(), OverrideRejection: OverrideRejection, RequesterFeedback: RequesterFeedback })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkAssignment.prototype.reject = function (RequesterFeedback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk.approveAssignment({ AssignmentId: this.getID(), RequesterFeedback: RequesterFeedback })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurkAssignment.prototype.getAnswers = function () {
        var data = parse(this.getAnswerString());
        var root = data.root;
        var result = new Map();
        root.children.forEach(function (child) {
            var name = child.name;
            if (name === 'Answer') {
                var children = child.children;
                var identifier_1;
                var value_1;
                children.forEach(function (c) {
                    var name = c.name, content = c.content;
                    if (name === 'QuestionIdentifier') {
                        identifier_1 = content;
                    }
                    else {
                        value_1 = content;
                    }
                });
                if (identifier_1 && value_1) {
                    result.set(identifier_1, value_1);
                }
            }
        });
        return result;
    };
    ;
    return MechanicalTurkAssignment;
}());
exports.MechanicalTurkAssignment = MechanicalTurkAssignment;
;
;
var MechanicalTurk = /** @class */ (function () {
    function MechanicalTurk(options) {
        this.templates = new Map();
        this.hitCache = new Map();
        this.assignmentCache = new Map();
        this.workerCache = new Map();
        this.options = _.extend({}, MechanicalTurk.DEFAULT_OPTIONS, options);
        var configFileName = this.options.configFileName;
        this.mturk = this.loadConfigFile(configFileName).then(function (config) {
            return new MTurk({
                region: REGION,
                endpoint: config.sandbox ? SANDBOX : PRODUCTION,
                accessKeyId: config.access,
                secretAccessKey: config.secret,
                apiVersion: API_VERSION
            });
        }, function (err) {
            throw new Error("Could not read config file " + configFileName + ". See mturk_creds.sample.json for an example format");
        });
    }
    ;
    MechanicalTurk.prototype.registerTemplate = function (name, templateString, templateSettings) {
        var tempFn = dot.template(templateString, templateSettings);
        this.templates.set(name, tempFn);
    };
    ;
    MechanicalTurk.prototype.processTemplateFile = function (name, path, templateSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getFileContents(path_1.resolve(this.options.templateDirectory, path))];
                    case 1:
                        fileContents = _a.sent();
                        this.registerTemplate(name, fileContents, templateSettings);
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.createHITFromTemplate = function (templateName, templateArguments, options) {
        return __awaiter(this, void 0, void 0, function () {
            var templateFn, questionContents;
            return __generator(this, function (_a) {
                if (!this.templates.has(templateName)) {
                    throw new Error("Could not find template " + templateName + ". Be sure you have called .registerTemplate(name, contents, settings?) or .processTemplateFile(name, path, settings?) beforehand.");
                }
                templateFn = this.templates.get(templateName);
                questionContents = templateFn(templateArguments);
                return [2 /*return*/, this.createHIT(_.extend({}, options, { Question: questionContents }))];
            });
        });
    };
    ;
    MechanicalTurk.prototype.createMechanicalTurkHIT = function (info) {
        var HITId = info.HITId;
        var mturkHIT;
        if (this.hitCache.has(HITId)) {
            mturkHIT = this.hitCache.get(HITId);
            mturkHIT.setInfo(info);
        }
        else {
            mturkHIT = new MechanicalTurkHIT(this, info);
            this.hitCache.set(HITId, mturkHIT);
        }
        return mturkHIT;
    };
    ;
    MechanicalTurk.prototype.createMechanicalTurkAssignment = function (hit, info) {
        var AssignmentId = info.AssignmentId;
        var mturkAssignment;
        if (this.assignmentCache.has(AssignmentId)) {
            mturkAssignment = this.assignmentCache.get(AssignmentId);
        }
        else {
            mturkAssignment = new MechanicalTurkAssignment(this, hit, info);
            this.assignmentCache.set(AssignmentId, mturkAssignment);
        }
        return mturkAssignment;
    };
    ;
    MechanicalTurk.prototype.createMechanicalTurkWorker = function (WorkerID) {
        var mturkWorker;
        if (this.workerCache.has(WorkerID)) {
            mturkWorker = this.workerCache.get(WorkerID);
        }
        else {
            mturkWorker = new MechanicalTurkWorker(this, WorkerID);
            this.workerCache.set(WorkerID, mturkWorker);
        }
        return mturkWorker;
    };
    ;
    MechanicalTurk.prototype.loadConfigFile = function (fileName) {
        return fileExists(fileName).then(function (exists) {
            if (exists) {
                return getFileContents(fileName);
            }
            else {
                throw new Error("Could not find config file " + fileName + ".");
            }
        }).then(function (contents) {
            return JSON.parse(contents);
        });
    };
    ;
    MechanicalTurk.prototype.getAccountBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.getAccountBalance({}, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(parseFloat(data.AvailableBalance));
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.createHIT = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.createHIT(options, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(_this.createMechanicalTurkHIT(data.HIT));
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.createHITFromFile = function (questionFileName, options) {
        return __awaiter(this, void 0, void 0, function () {
            var questionContents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getFileContents(questionFileName)];
                    case 1:
                        questionContents = _a.sent();
                        return [2 /*return*/, this.createHIT(_.extend({}, options, { Question: questionContents }))];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.getRawHIT = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.getHIT(options, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data.HIT);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.getHIT = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var HITResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRawHIT(options)];
                    case 1:
                        HITResult = _a.sent();
                        return [2 /*return*/, this.createMechanicalTurkHIT(HITResult)];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.deleteHIT = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                mturk.deleteHIT(options, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.listHITs = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.listHITs(options, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data.HITs.map(function (hit) { return _this.createMechanicalTurkHIT(hit); }));
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.listRawAssignmentsForHIT = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.listAssignmentsForHIT(options, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data.Assignments);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.approveAssignment = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.approveAssignment(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.rejectAssignment = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.rejectAssignment(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.updateExpirationForHIT = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.updateExpirationForHIT(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.updateHITReviewStatus = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.updateHITReviewStatus(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.createWorkerBlock = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.createWorkerBlock(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.deleteWorkerBlock = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.deleteWorkerBlock(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.notifyWorkers = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mturk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.mturk];
                    case 1:
                        mturk = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                mturk.notifyWorkers(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.DEFAULT_OPTIONS = {
        configFileName: path_1.join(__dirname, '..', 'mturk_creds.json'),
        templateDirectory: path_1.join(__dirname, '..', 'templates')
    };
    return MechanicalTurk;
}());
exports.MechanicalTurk = MechanicalTurk;
;
function fileExists(fileName) {
    return new Promise(function (resolve, reject) {
        fs.access(fileName, fs.R_OK, function (err) {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
function getFileContents(fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, 'utf8', function (err, data) {
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
//# sourceMappingURL=mturk.js.map