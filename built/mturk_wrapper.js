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
exports.__esModule = true;
var mturk = require("mturk-api");
var _ = require("underscore");
var fs = require("fs");
var path_1 = require("path");
;
var MechanicalTurkHIT = /** @class */ (function () {
    function MechanicalTurkHIT(mturk, info) {
        this.mturk = mturk;
        this.info = info;
    }
    ;
    MechanicalTurkHIT.prototype.setInfO = function (info) {
        this.info = info;
    };
    MechanicalTurkHIT.prototype.getID = function () { return this.info.HITId; };
    MechanicalTurkHIT.prototype.disable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.mturk.disableHIT(this.getID())];
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.mturk.disposeHIT(this.getID())];
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.listAssignments = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.mturk.disposeHIT(this.getID())];
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.setHITAsReviewing = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.mturk.setHITAsReviewing(this.getID())];
            });
        });
    };
    ;
    MechanicalTurkHIT.prototype.getReviewStatus = function () {
        return this.info.HITReviewStatus;
    };
    ;
    MechanicalTurkHIT.prototype.toString = function () {
        return "HIT " + this.getID();
    };
    ;
    MechanicalTurkHIT.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.mturk.getRawHIT(this.getID())];
                    case 1:
                        _a.info = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return MechanicalTurkHIT;
}());
exports.MechanicalTurkHIT = MechanicalTurkHIT;
;
var MechanicalTurk = /** @class */ (function () {
    function MechanicalTurk(options, configFileName) {
        if (configFileName === void 0) { configFileName = path_1.join(__dirname, '..', 'mturk_creds.json'); }
        var _this = this;
        this.options = _.extend({}, MechanicalTurk.defaultOptions, options);
        this.readyPromise = this.loadConfigFile(configFileName).then(function (config) {
            return mturk.createClient(config);
        })["catch"](function (err) {
            throw new Error("Could not read config file " + configFileName + ". See mturk_creds.sample.json for an example format");
        }).then(function (mturkAPI) {
            _this.mturkAPI = mturkAPI;
            return _this;
        }, function (err) {
            console.error(err);
            throw (err);
        });
    }
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
    MechanicalTurk.prototype.ready = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.readyPromise];
            });
        });
    };
    ;
    MechanicalTurk.prototype.getAccountBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.mturkAPI.req('GetAccountBalance').then(function (result) {
                                var firstResult = result.GetAccountBalanceResult[0];
                                var AvailableBalance = firstResult.AvailableBalance;
                                if (AvailableBalance.CurrencyCode === _this.options.currencyCode) {
                                    return parseFloat(AvailableBalance.Amount);
                                }
                                else {
                                    throw new Error("Result currency code (" + AvailableBalance.CurrencyCode + ") does not mach specified option currency code " + _this.options.currencyCode);
                                }
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.createHIT = function (title, description, durationInSeconds, lifetimeInSeconds, rewardAmount, question) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        options = {
                            Title: title,
                            Description: description,
                            AssignmentDurationInSeconds: durationInSeconds,
                            LifetimeInSeconds: lifetimeInSeconds,
                            Reward: { CurrencyCode: this.options.currencyCode, Amount: rewardAmount },
                            Question: question
                        };
                        return [2 /*return*/, this.mturkAPI.req('CreateHIT', options).then(function (result) {
                                var HITResult = result.HIT[0];
                                return _this.getHIT(HITResult.HITId);
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.getRawHIT = function (HITId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.mturkAPI.req('GetHIT', { HITId: HITId }).then(function (result) {
                                return result.HIT[0];
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.getHIT = function (HITId) {
        return __awaiter(this, void 0, void 0, function () {
            var HITResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRawHIT(HITId)];
                    case 1:
                        HITResult = _a.sent();
                        return [2 /*return*/, new MechanicalTurkHIT(this, HITResult)];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.disposeHIT = function (HITId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.mturkAPI.req('DisposeHIT', { HITId: HITId }).then(function (result) {
                                return true;
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.disableHIT = function (HITId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.mturkAPI.req('DisableHIT', { HITId: HITId }).then(function (result) {
                                return true;
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.setHITAsReviewing = function (HITId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mturkAPI.req('SetHITAsReviewing', { HITId: HITId })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.listAssignments = function (HITId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.mturkAPI.req('ListAssignmentsForHIT', { HITId: HITId }).then(function (result) {
                                console.log(result);
                                return true;
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.prototype.searchHITs = function (PageSize) {
        if (PageSize === void 0) { PageSize = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.mturkAPI.req('SearchHITs', { PageSize: PageSize }).then(function (result) {
                                var searchHITsResult = result.SearchHITsResult[0];
                                if (searchHITsResult.NumResults === 0) {
                                    return [];
                                }
                                else {
                                    return searchHITsResult.HIT.map(function (hit) {
                                        return new MechanicalTurkHIT(_this, hit);
                                    });
                                }
                            })];
                }
            });
        });
    };
    ;
    MechanicalTurk.defaultOptions = {
        currencyCode: 'USD'
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
//# sourceMappingURL=mturk_wrapper.js.map