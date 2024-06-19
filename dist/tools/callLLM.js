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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var store_1 = __importDefault(require("../store")); // Import the zustand store
exports.default = {
    schema: {
        "name": "callLLM",
        "description": "Call the LLM with the given prompt and instructions (system prompt).",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string"
                },
                "instructions": {
                    "type": "string"
                },
                "tools": {
                    "type": "boolean"
                },
            },
            "required": [
                "prompt",
                "instructions"
            ]
        }
    },
    action: function (_a, api) {
        var prompt = _a.prompt, instructions = _a.instructions, tools = _a.tools, _b = _a.model, model = _b === void 0 ? 'claude-3-opus-20240229' : _b;
        return __awaiter(void 0, void 0, void 0, function () {
            var state_1, schemas, response, data, result_1, toolCalls_1, toolsResult, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        state_1 = store_1.default.getState();
                        schemas = tools //? Object.keys(tools).map((toolName: any) => tools[toolName].schema) : [];
                        ;
                        return [4 /*yield*/, axios_1.default.post('https://api.anthropic.com/v1/messages', {
                                model: model, max_tokens: 4000,
                                system: instructions, tools: schemas,
                                messages: [{ role: 'user', content: prompt, },],
                            }, {
                                headers: {
                                    'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY,
                                    'anthropic-version': '2023-06-01', 'anthropic-beta': 'tools-2024-04-04',
                                },
                            })];
                    case 1:
                        response = _c.sent();
                        data = response.data;
                        result_1 = [];
                        toolCalls_1 = [];
                        if (!Array.isArray(data.content)) return [3 /*break*/, 3];
                        data.content = data.content.map(function (item) {
                            if (item.type === 'tool_use') {
                                item.parameters = item.input;
                                toolCalls_1.push(item);
                                console.log('tool_call', item);
                            }
                            else {
                                try {
                                    var ret = JSON.parse(item.text);
                                    if (ret.tools) {
                                        toolCalls_1 = __spreadArray(__spreadArray([], toolCalls_1, true), ret.tools, true);
                                    }
                                    else {
                                        result_1.push(ret);
                                    }
                                    if (ret.percentComplete) {
                                        store_1.default.setState(__assign(__assign({}, state_1), { percentComplete: ret.percentComplete })); // Update the state using zustand
                                    }
                                    if (ret.currentTaskComplete) {
                                        if (state_1.currentTask)
                                            console.log("Task ".concat(state_1.currentTask.name, " is complete."));
                                        store_1.default.getState().completeCurrentTask();
                                    }
                                }
                                catch (error) {
                                    result_1.push(item.text);
                                    console.log(item.text);
                                }
                            }
                        });
                        return [4 /*yield*/, api.callTools(toolCalls_1, state_1)];
                    case 2:
                        toolsResult = _c.sent();
                        result_1 = __spreadArray(__spreadArray([], result_1, true), toolsResult, true);
                        _c.label = 3;
                    case 3: return [2 /*return*/, result_1];
                    case 4:
                        error_1 = _c.sent();
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
};
