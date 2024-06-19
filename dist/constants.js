"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerStates = void 0;
var WorkerStates;
(function (WorkerStates) {
    WorkerStates["RESET"] = "RESET";
    WorkerStates["SET_STATE"] = "SET_STATE";
    WorkerStates["SET_PERCENT_COMPLETE"] = "SET_PERCENT_COMPLETE";
    WorkerStates["COMPLETE_TASK"] = "COMPLETE_TASK";
    WorkerStates["COMPLETE_SESSION"] = "COMPLETE_SESSION";
})(WorkerStates = exports.WorkerStates || (exports.WorkerStates = {}));
