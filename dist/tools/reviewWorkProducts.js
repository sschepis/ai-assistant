"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
exports.default = {
    schema: {
        "name": "reviewWorkProducts",
        "description": "Review the generated work product for the current task, submit a updated work product and close the task if its complete",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    action: function (_, api) { return __awaiter(void 0, void 0, void 0, function () {
        var state, currentTask, workProducts, ret, item;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Reviewing work products...');
                    state = api.store.getState();
                    currentTask = state.currentTask;
                    workProducts = (_a = state.currentTask) === null || _a === void 0 ? void 0 : _a.workProducts;
                    if (!workProducts) {
                        return [2 /*return*/, 'No work products found for the task ' + currentTask];
                    }
                    return [4 /*yield*/, api.callTool('callLLM', {
                            prompt: "Your goal is to review the generated work products for the current task and output a refined work product, whether the current task is complete, and an updated percent complete for the overall project IN JSON FORMAT with format { workProduct: string, currentTaskComplete: boolean, percentComplete: number }.  The current project state is: ".concat(JSON.stringify(state), ". Return your response in JSON format using format { workProduct: string, currentTaskComplete: boolean, percentComplete: number }."),
                            instructions: 'You are an expert agent operating in an autonomous execution context. Your goal is to review the generated work products for the current task and output an updated work product and percentComplete estimate. The current workspace folder is: ' + process.cwd() + '. You are operating on a ' + process.platform + ' machine. *** RETURN ALL RESPONSES USING FORMAT { workProduct: string, currentTaskComplete: boolean, percentComplete: number } ***',
                            tools: []
                        })];
                case 1:
                    ret = _b.sent();
                    try {
                        item = ret[0];
                        try {
                            item = JSON.parse(item.text || item);
                        }
                        catch (error) { }
                        if (item.workProduct)
                            item.addWorkProductToCurrentTask(item.workProduct);
                        if (item.percentComplete)
                            state.setState(__assign(__assign({}, state), { percentComplete: item.percentComplete }));
                        if (item.currentTaskComplete) {
                            console.log("Task ".concat(state.currentTask.name, " is complete."));
                            state.completeCurrentTask();
                        }
                    }
                    catch (error) { }
                    return [2 /*return*/];
            }
        });
    }); }
};
//# sourceMappingURL=reviewWorkProducts.js.map