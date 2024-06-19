"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = __importDefault(require("../store")); // Import the zustand store
exports.default = {
    schema: {
        "name": "performTask",
        "description": "Perform the given task. Generates work products and updates the project state.",
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string"
                }
            },
            "required": [
                "task"
            ]
        }
    },
    action: function (_a, api) {
        var task = _a.task;
        return __awaiter(void 0, void 0, void 0, function () {
            var state, toolsHelp, _b, _c, resp;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        state = store_1.default.getState();
                        console.log("Performing task: ".concat(task));
                        _c = (_b = JSON).stringify;
                        return [4 /*yield*/, api.callTool('getToolsHelp', {})];
                    case 1:
                        toolsHelp = _c.apply(_b, [_d.sent()]);
                        resp = function (_useTools, firstResponse) { return __awaiter(void 0, void 0, void 0, function () {
                            var theTools, response, toolsUsed, results, _i, response_1, ri, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        theTools = Object.keys(api.tools).map(function (toolName) { return api.tools[toolName].schema; });
                                        delete theTools.getNextAction;
                                        return [4 /*yield*/, api.callTool('callLLM', {
                                                prompt: _useTools ?
                                                    "Your goal is to perform the given task to the best of your abilities using a creative combination of your innate skills and tooling.\n\nYou previously determined that you need tools to complete the following task:\n\nTask: ".concat(task, "\n\nYou mentioned the following tools:\n").concat(firstResponse, "\n\nCurrent project state: ").concat(JSON.stringify(state), "\n\nRecent history: ").concat(JSON.stringify(state.history || "No history yet."), " yeah\n\nInstructions:\n- Use the provided tools to perform the task and generate the work product(s).\n- Determine the overall percent completion of the project and update the percent complete field in the project state.")
                                                    :
                                                        "Your goal is to perform the given task to the best of your abilities using a creative combination of your innate skills and tooling.\n\nTask: ".concat(task, "\n  \nCurrent project state: ").concat(JSON.stringify(state), "\n  \nRecent history: ").concat(JSON.stringify(state.history || "No history yet"), "\n  \nInstructions:\n- Analyze the task and determine if you can complete it without using any tools.\n- If you can complete the task without tools, perform the task and return the generated work product(s) in the specified JSON format. DO NOT EMBED TOOL CALLS IN WORK PRODUCTS!\n- If you require tools to complete the task, list the specific tools you would use and describe how you would use them to perform the task. Do not actually call the tools.\n\nThe list of available tools are: ").concat(toolsHelp, "\n  \nResponse Format (without tools):\nIf completing the task without tools, return the work product(s) in the following JSON format (exclude the angled brackets):\n<{\n  \"workProducts\": [\n    {\n      \"type\": \"file/chat\",\n      \"name\": <optional_name>,\n      \"data\": <work_product_content>\n    },\n    ...n  ]\n}>\n  \nIf tools are required, provide your response in json format as follows:\n{\n  \"tools\": [{\n    name: \"tool_name\",\n    parameters: {\n      \"param1\": \"value1\",\n      \"param2\": \"value2\",\n      ...\n    }\n  }, ...]\n}\n\n*** YOU MUST ONLY RETURN JSON FORMATTED DATA. DO NOT INCLUDE ANY ADDITIONAL TEXT OR CODE BLOCKS IN YOUR RESPONSE. ***"),
                                                instructions: 'Your goal is to perform the given task to the best of your abilities. The current workspace folder is: ' + process.cwd() + '. This machine is a ' + process.platform + ' machine. OUTPUT JSON ONLY!!!',
                                                tools: _useTools ? theTools : [],
                                            })];
                                    case 1:
                                        response = _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 11, , 12]);
                                        if (!Array.isArray(response))
                                            response = [response];
                                        toolsUsed = false;
                                        results = [];
                                        _i = 0, response_1 = response;
                                        _a.label = 3;
                                    case 3:
                                        if (!(_i < response_1.length)) return [3 /*break*/, 7];
                                        ri = response_1[_i];
                                        if (!(!_useTools && ri.tools)) return [3 /*break*/, 5];
                                        if (!Array.isArray(ri.tools)) {
                                            ri.tools = [ri.tools];
                                        }
                                        toolsUsed = true;
                                        return [4 /*yield*/, api.callTools(ri.tools, state)];
                                    case 4: return [2 /*return*/, _a.sent()];
                                    case 5:
                                        if (!_useTools && ri.workProducts) {
                                            results.push(ri.workProducts);
                                        }
                                        else {
                                            results.push(ri);
                                        }
                                        _a.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 7:
                                        if (!!toolsUsed) return [3 /*break*/, 9];
                                        return [4 /*yield*/, resp(true, JSON.stringify(results))];
                                    case 8: return [2 /*return*/, _a.sent()];
                                    case 9: return [2 /*return*/, results];
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        error_1 = _a.sent();
                                        return [2 /*return*/, response[0].text || response[0]];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [2 /*return*/, resp(false, '')];
                }
            });
        });
    }
};
