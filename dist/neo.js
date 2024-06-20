"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var eventemitter3_1 = require("eventemitter3");
var axios_1 = __importDefault(require("axios"));
var shelljs_1 = __importDefault(require("shelljs"));
// extract json from a string. these might be text around the json so this function applies a regex to extract the json, which cuould either be a single json object or an array of json objects
function extractJson(content) {
    var jsonObjects = [];
    var currentObject = '';
    var openBraces = 0;
    var openBrackets = 0;
    var inString = false;
    var escapeNext = false;
    for (var i = 0; i < content.length; i++) {
        var char = content[i];
        if (char === '{' && !inString) {
            openBraces++;
            if (openBraces === 1) {
                currentObject = '{';
            }
            else {
                currentObject += char;
            }
        }
        else if (char === '}' && !inString) {
            openBraces--;
            currentObject += char;
            if (openBraces === 0) {
                try {
                    var parsedObject = JSON.parse(currentObject);
                    jsonObjects.push(parsedObject);
                    currentObject = '';
                }
                catch (error) {
                    // Invalid JSON, ignore and continue
                    currentObject = '';
                }
            }
        }
        else if (char === '[' && !inString) {
            openBrackets++;
            currentObject += char;
        }
        else if (char === ']' && !inString) {
            openBrackets--;
            currentObject += char;
        }
        else if (char === '"' && !escapeNext) {
            inString = !inString;
            currentObject += char;
        }
        else if (char === '\\' && !escapeNext) {
            escapeNext = true;
            currentObject += char;
        }
        else {
            escapeNext = false;
            currentObject += char;
        }
    }
    return jsonObjects;
}
var Assistant = /** @class */ (function (_super) {
    __extends(Assistant, _super);
    function Assistant() {
        var _this = _super.call(this) || this;
        _this.apiKey = process.env.ANTHROPIC_API_KEY || '';
        _this.callTool = _this.callTool.bind(_this);
        _this.store = {};
        function getNonce() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        _this.tools = {
            echo: {
                schema: {
                    "name": "echo",
                    "description": "Print the given text to the console",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "The text to print"
                            }
                        },
                        "required": ["text"]
                    }
                },
                action: function (_a, api) {
                    var text = _a.text;
                    return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_b) {
                            api.emit('text', text);
                            return [2 /*return*/, text];
                        });
                    });
                }
            },
            ask: {
                schema: {
                    "name": "ask",
                    "description": "Ask the user a question and return their response",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string",
                                "description": "The question to ask the user"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": ["prompt"]
                    }
                },
                action: function (_a, api) {
                    var prompt = _a.prompt, resultVar = _a.resultVar;
                    return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_b) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    api.emit('text', prompt);
                                    api.chatWindow = function (response) {
                                        if (resultVar) {
                                            api.store[resultVar] = response;
                                        }
                                        resolve(response);
                                    };
                                })];
                        });
                    });
                }
            },
            busybox: {
                schema: {
                    "name": "busybox",
                    "description": "A versatile function that provides a lot of functionality. Commands include 'ls', 'cat', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'find', 'chmod', 'chown', 'stat', 'node', 'python', 'jq', 'date', 'hostname', 'whoami', 'uptime', 'ping', 'curl', 'wget', 'echo', 'grep', 'sed', 'awk', 'git', 'ps', 'kill', 'help'.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "command": {
                                "type": "string",
                                "description": "The command to execute (e.g., 'ls', 'cat file.txt')."
                            },
                            "args": {
                                "type": "array",
                                "description": "An array of arguments for the command."
                            },
                            "options": {
                                "type": "object",
                                "description": "Optional settings for execution."
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable name to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        }
                    },
                    "output_schema": {
                        "type": "string",
                        "description": "The output of the command, either as a string or Buffer."
                    }
                },
                action: function (params_array, api) { return __awaiter(_this, void 0, void 0, function () {
                    var _loop_1, _a, _b, _c, _i, params, state_1;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _loop_1 = function (params) {
                                    var _e, command, _f, args, _g, options, resultVar, supportedCommands, cmdFunction, result, error_1;
                                    return __generator(this, function (_h) {
                                        switch (_h.label) {
                                            case 0:
                                                _e = params_array[params], command = _e.command, _f = _e.args, args = _f === void 0 ? [] : _f, _g = _e.options, options = _g === void 0 ? {} : _g, resultVar = _e.resultVar;
                                                supportedCommands = {
                                                    // File system
                                                    'ls': function (args) {
                                                        if (!Array.isArray(args)) {
                                                            args = [args];
                                                        }
                                                        if (args.length === 0) {
                                                            args = ['.']; // Default to current directory
                                                        }
                                                        return shelljs_1.default.ls.apply(shelljs_1.default, args).toString();
                                                    },
                                                    'cat': function (args) {
                                                        if (!Array.isArray(args)) {
                                                            args = [args];
                                                        }
                                                        if (args.length === 0) {
                                                            throw new Error('cat: missing file');
                                                        }
                                                        return shelljs_1.default.cat.apply(shelljs_1.default, args).toString();
                                                    },
                                                    'pwd': function () { return shelljs_1.default.pwd().toString(); },
                                                    'mkdir': function (args) {
                                                        if (!Array.isArray(args)) {
                                                            args = [args];
                                                        }
                                                        if (args.length === 0) {
                                                            throw new Error('mkdir: missing directory');
                                                        }
                                                        return shelljs_1.default.mkdir.apply(shelljs_1.default, args);
                                                    },
                                                    'touch': function (args) {
                                                        if (!Array.isArray(args)) {
                                                            args = [args];
                                                        }
                                                        if (args.length === 0) {
                                                            throw new Error('touch: missing file');
                                                        }
                                                        return shelljs_1.default.touch.apply(shelljs_1.default, args);
                                                    },
                                                    'rm': function (args) {
                                                        if (!Array.isArray(args)) {
                                                            args = [args];
                                                        }
                                                        if (args.length === 0) {
                                                            throw new Error('rm: missing file');
                                                        }
                                                        return shelljs_1.default.rm.apply(shelljs_1.default, args);
                                                    },
                                                    'cp': function (args) { return shelljs_1.default.cp.apply(shelljs_1.default, args); },
                                                    'mv': function (args) { return shelljs_1.default.mv.apply(shelljs_1.default, args); },
                                                    'find': function (args) { return shelljs_1.default.exec("find ".concat(args.join(' ')), options).toString(); },
                                                    'chmod': function (args) { return shelljs_1.default.exec("chmod ".concat(args.join(' ')), options).toString(); },
                                                    'chown': function (args) { return shelljs_1.default.exec("chown ".concat(args.join(' ')), options).toString(); },
                                                    'stat': function (args) { return shelljs_1.default.exec("stat ".concat(args.join(' ')), options).toString(); },
                                                    // code execution
                                                    'node': function (args) { return shelljs_1.default.exec("node ".concat(args.join(' ')), options).toString(); },
                                                    'python': function (args) { return shelljs_1.default.exec("python ".concat(args.join(' ')), options).toString(); },
                                                    'jq': function (args) { return shelljs_1.default.exec("jq ".concat(args.join(' ')), options).toString(); },
                                                    // System info
                                                    'date': function () { return shelljs_1.default.exec('date', options).toString(); },
                                                    'hostname': function () { return shelljs_1.default.hostname().toString(); },
                                                    'whoami': function () { return shelljs_1.default.exec('whoami', options).toString(); },
                                                    'uptime': function () { return shelljs_1.default.exec('uptime', options).toString(); },
                                                    // Network
                                                    'ping': function (args) { return shelljs_1.default.exec("ping ".concat(args.join(' '), " -c 4"), options).toString(); },
                                                    'curl': function (args) { return shelljs_1.default.exec("curl ".concat(args.join(' ')), options).toString(); },
                                                    'wget': function (args) { return shelljs_1.default.exec("wget ".concat(args.join(' ')), options).toString(); },
                                                    // String manipulation
                                                    'echo': function (args) { return shelljs_1.default.echo.apply(shelljs_1.default, args).toString(); },
                                                    'grep': function (args) { return shelljs_1.default.grep.apply(shelljs_1.default, args).toString(); },
                                                    'sed': function (args) { return shelljs_1.default.sed.apply(shelljs_1.default, args).toString(); },
                                                    'awk': function (args) { return shelljs_1.default.exec("awk ".concat(args.join(' ')), options).toString(); },
                                                    // Process management (simple examples)
                                                    'git': function (args) { return shelljs_1.default.exec("git ".concat(args.join(' ')), options).toString(); },
                                                    'ps': function () { return shelljs_1.default.exec('ps', options).toString(); },
                                                    'kill': function (args) {
                                                        if (args.length === 0) {
                                                            throw new Error('kill: missing process id');
                                                        }
                                                        return shelljs_1.default.exec("kill ".concat(args.join(' ')), options);
                                                    },
                                                    // Help
                                                    'help': function () { return "Available commands:\n".concat(Object.keys(supportedCommands).join('\n')); }
                                                };
                                                cmdFunction = supportedCommands[command];
                                                if (!cmdFunction) return [3 /*break*/, 5];
                                                _h.label = 1;
                                            case 1:
                                                _h.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, cmdFunction.apply(void 0, args)];
                                            case 2:
                                                result = _h.sent();
                                                // ShellJS often returns objects with stdout/stderr, so normalize to string
                                                result = result.toString ? result.toString() : result;
                                                if (resultVar) {
                                                    api.store[resultVar] = result;
                                                }
                                                return [2 /*return*/, { value: result }];
                                            case 3:
                                                error_1 = _h.sent();
                                                throw new Error("Error executing '".concat(command, "': ").concat(error_1.message));
                                            case 4: return [3 /*break*/, 6];
                                            case 5: throw new Error("Invalid command: '".concat(command, "'"));
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                };
                                _a = params_array;
                                _b = [];
                                for (_c in _a)
                                    _b.push(_c);
                                _i = 0;
                                _d.label = 1;
                            case 1:
                                if (!(_i < _b.length)) return [3 /*break*/, 4];
                                _c = _b[_i];
                                if (!(_c in _a)) return [3 /*break*/, 3];
                                params = _c;
                                return [5 /*yield**/, _loop_1(params)];
                            case 2:
                                state_1 = _d.sent();
                                if (typeof state_1 === "object")
                                    return [2 /*return*/, state_1.value];
                                _d.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); },
            },
            callLLM: {
                schema: {
                    "name": "callLLM",
                    "description": "Call the LLM with the given system prompt and prompt. Can generate documentation, code, or other text. Parses JSON results into a JavaScript object.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string"
                            },
                            "system_prompt": {
                                "type": "string"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompt",
                            "instructions"
                        ]
                    }
                },
                action: function (_a, api) {
                    var prompt = _a.prompt, system_prompt = _a.system_prompt, resultVar = _a.resultVar;
                    return __awaiter(_this, void 0, void 0, function () {
                        var model, response, data, rr, error_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    model = 'claude-3-opus-20240229';
                                    return [4 /*yield*/, axios_1.default.post('https://api.anthropic.com/v1/messages', {
                                            model: model, max_tokens: 4000,
                                            system: system_prompt, tools: [],
                                            messages: [{ role: 'user', content: prompt, },],
                                        }, {
                                            headers: {
                                                'Content-Type': 'application/json', 'x-api-key': api.apiKey,
                                                'anthropic-version': '2023-06-01', 'anthropic-beta': 'tools-2024-04-04',
                                            },
                                        })];
                                case 1:
                                    response = _b.sent();
                                    data = response.data.content[0].text.trim();
                                    try {
                                        rr = JSON.parse(data);
                                        if (resultVar) {
                                            api.store[resultVar] = rr;
                                        }
                                        return [2 /*return*/, rr];
                                    }
                                    catch (error) {
                                        if (resultVar) {
                                            api.store[resultVar] = data;
                                        }
                                        return [2 /*return*/, data];
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _b.sent();
                                    throw error_2;
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                }
            },
            call_agent: {
                schema: {
                    "name": "call_agent",
                    "description": "Call the agent with the given task to perform. Be descriptive and specific, giving the agent all the information it needs to perform its work.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompt"
                        ]
                    }
                },
                action: function (_a, api) {
                    var prompt = _a.prompt, _b = _a.model, model = _b === void 0 ? 'claude-3-opus-20240229' : _b, resultVar = _a.resultVar;
                    return __awaiter(_this, void 0, void 0, function () {
                        var response, ret, tasks, results, _i, tasks_1, task, taskName, script, chat, splitTask, taskId, sr, rout, error_3;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 6, , 7]);
                                    return [4 /*yield*/, axios_1.default.post('https://api.anthropic.com/v1/messages', {
                                            model: model, max_tokens: 4000,
                                            system: "YOU ARE A COMMAND-EXECUTION AGENT that translates a task to perform, and functions to use to accomplish those tasks, into one or more scripts that use the provided functions to perform the work.\nYOU TRANSFORM a task into a sequence of subtasks with associated scripts that use the provided functions to perform the work.\nCONSIDER how you might assemble the provided functions into one or more scripts chaperoned by you to perform the given task.\nTHINK ABOUT the optimal sequence of tool calls you need to make to get the task done\nDESIGN one or more javascript scripts that use the provided tools to perform the work.\nUse scripts to sequence function calls to perform the work. use subtasks to sequence scripts, allowing you to build up complex functionality from simpler parts.\nDECOMPOSE the given task into subtasks with scripts that use the provided tools.\nTHEN (return a JSON array of the subtasks, each with a JavaScript script that uses the provided tools to perform the work and *returns* a JSON result (for example `... return tools.bash({\"command\":\"ls\",\"args\":[\"-al\",\"./\"]})` ). Each subtask must generate a clear deliverable and THE DELIVERABLE MUST BE MATERIALLY USEFUL TO SUBSEQUENT TASKS (be referred to by a subsequent task)! The results of priaor tasks are available in the `taskResults` object, indexed by the task name_results (for example, `taskResults.myTask_results`).\nFORMAT ALL OUTPUT USING JSON [{ \"task\": \"<taskvar>:<task>\", \"script\": \"<JavaScript script - use `taskResults.<taskvar>_results` to get or modify task results from earlier tasks>\", \"chat\": \"<reasoning and explanation for task>\" }, ...] DO NOT PROVIDE ANY COMMENTARY BELOW OR AFTER YOUR OUTPUT. *** OUTPUT ONLY RAW, VALID JSON!! ***", tools: [],
                                            messages: [{
                                                    role: 'user', content: JSON.stringify({
                                                        tools: Object.keys(api.tools).map(function (tool) { return api.tools[tool].schema; }),
                                                        task: prompt,
                                                    })
                                                }],
                                        }, {
                                            headers: {
                                                'Content-Type': 'application/json', 'x-api-key': api.apiKey,
                                                'anthropic-version': '2023-06-01', 'anthropic-beta': 'tools-2024-04-04',
                                            },
                                        })];
                                case 1:
                                    response = _c.sent();
                                    ret = response.data.content[0].text;
                                    tasks = extractJson(ret);
                                    results = [];
                                    api.store[prompt] = tasks;
                                    if (resultVar) {
                                        api.store[resultVar] = [];
                                    }
                                    _i = 0, tasks_1 = tasks;
                                    _c.label = 2;
                                case 2:
                                    if (!(_i < tasks_1.length)) return [3 /*break*/, 5];
                                    task = tasks_1[_i];
                                    taskName = task.task, script = task.script, chat = task.chat;
                                    splitTask = taskName.split(':');
                                    taskId = taskName;
                                    if (splitTask.length > 1) {
                                        taskId = splitTask[0];
                                        taskName = splitTask[1];
                                    }
                                    api.store['currentTaskId'] = taskId;
                                    this.emit('taskId', taskId);
                                    api.store["".concat(taskId, "_task")] = task;
                                    this.emit("".concat(taskId, "_task"), task);
                                    api.store["".concat(taskId, "_chat")] = chat;
                                    this.emit("".concat(taskId, "_chat"), chat);
                                    api.store["".concat(taskId, "_script")] = script;
                                    this.emit("".concat(taskId, "_script"), script);
                                    return [4 /*yield*/, this.callScript(script)];
                                case 3:
                                    sr = _c.sent();
                                    task.scriptResult = sr;
                                    this.store["".concat(taskId, "_results")] = sr;
                                    rout = { id: taskId, task: taskName, script: script, result: sr };
                                    this.emit("".concat(taskId, "_results"), rout);
                                    results.push(rout);
                                    _c.label = 4;
                                case 4:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 5:
                                    if (resultVar) {
                                        api.store[resultVar] = results;
                                    }
                                    return [2 /*return*/, results];
                                case 6:
                                    error_3 = _c.sent();
                                    throw error_3;
                                case 7: return [2 /*return*/];
                            }
                        });
                    });
                }
            },
            // uses Promise.all to run multiple agent processes in parallel. calls the call_agent tool for each agent process
            call_agents: {
                schema: {
                    "name": "call_agents",
                    "description": "Call multiple agents with the given tasks to perform. Be descriptive and specific, giving the agents all the information they need to perform their work.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompts": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompts"
                        ]
                    }
                },
                action: function (_a, api) {
                    var prompts = _a.prompts, resultVar = _a.resultVar;
                    return __awaiter(_this, void 0, void 0, function () {
                        var results, error_4;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, Promise.all(prompts.map(function (prompt) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, api.callTool('call_agent', { prompt: prompt, model: 'claude-3-opus-20240229' })];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); }))];
                                case 1:
                                    results = _b.sent();
                                    if (resultVar) {
                                        api.store[resultVar] = results;
                                    }
                                    return [2 /*return*/, results];
                                case 2:
                                    error_4 = _b.sent();
                                    throw error_4;
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                }
            },
            callLLMs: {
                schema: {
                    "name": "callLLMs",
                    "description": "Call the LLM with the given system prompt and prompts. Can generate documentation, code, and other text concurrently. Parses JSON results into a JavaScript object.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompts": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "system_prompt": {
                                "type": "string"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompts",
                            "system_prompt"
                        ]
                    }
                },
                action: function (_a, api) {
                    var prompts = _a.prompts, system_prompt = _a.system_prompt, resultVar = _a.resultVar;
                    return __awaiter(_this, void 0, void 0, function () {
                        var results, error_5;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, Promise.all(prompts.map(function (prompt) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, api.callTool('callLLM', { prompt: prompt, system_prompt: system_prompt })];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); }))];
                                case 1:
                                    results = _b.sent();
                                    if (resultVar) {
                                        api.store[resultVar] = results;
                                    }
                                    return [2 /*return*/, results];
                                case 2:
                                    error_5 = _b.sent();
                                    throw error_5;
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                }
            },
        };
        return _this;
    }
    Assistant.prototype.callTool = function (toolName, params) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.tools[toolName].action(params, this)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Assistant.prototype.callAgent = function (input, onUpdate) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.on('taskId', function (task) {
                            _this.on("".concat(task, "_chat"), function (chat) {
                                onUpdate(chat);
                            });
                            _this.on("".concat(task, "_results"), function (result) {
                                onUpdate(result);
                            });
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.callTool('call_agent', { prompt: input, resultVar: 'result' })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response[0]];
                    case 3:
                        error_6 = _a.sent();
                        onUpdate("Error calling agent: ".concat(error_6.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Assistant.prototype.callScript = function (script) {
        return __awaiter(this, void 0, void 0, function () {
            var context, _loop_2, toolName, task, scriptFunction, error_7;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = {
                            tools: {},
                            taskResults: {}
                        };
                        _loop_2 = function (toolName) {
                            context.tools[toolName] = function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.callTool(toolName, args)];
                                            case 1: return [2 /*return*/, _a.sent()];
                                        }
                                    });
                                });
                            };
                        };
                        for (toolName in this.tools) {
                            _loop_2(toolName);
                        }
                        for (task in this.store) {
                            context.taskResults[task] = this.store[task];
                            context[task] = this.store[task];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        scriptFunction = new Function('context', "\n                    with (context) {\n                        return (async function() {\n                            ".concat(script, "\n                        })();\n                    }\n                "));
                        return [4 /*yield*/, scriptFunction(context)];
                    case 2: 
                    // Return the script result
                    return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        return [4 /*yield*/, this.handleScriptError(error_7, script, context)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Assistant.prototype.handleScriptError = function (error, script, context) {
        return __awaiter(this, void 0, void 0, function () {
            var errorMessage, stackTrace, errorLine, llmResponse, modifiedScript, explanation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorMessage = error.message;
                        stackTrace = error.stack;
                        errorLine = this.extractErrorLine(stackTrace);
                        return [4 /*yield*/, this.callTool('callLLM', {
                                system_prompt: 'Analyze the provided script, script error, and context, generate a fixed version of the script, and output it and an explanation of your work *in a JSON object*. Output the modified script and explanation *in JSON format* { modifiedScript, explanation }. ***OUTPUT RAW JSON ONLY***.',
                                prompt: JSON.stringify({
                                    error: errorMessage,
                                    stackTrace: stackTrace,
                                    script: script,
                                    errorLine: errorLine,
                                    context: context
                                })
                            })];
                    case 1:
                        llmResponse = _a.sent();
                        modifiedScript = llmResponse.modifiedScript, explanation = llmResponse.explanation;
                        this.emit('text', explanation);
                        return [4 /*yield*/, this.callScript(modifiedScript)];
                    case 2: 
                    // Update the script and re-execute it
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Assistant.prototype.extractErrorLine = function (stackTrace) {
        var lineRegex = /at .*? \(.*?:(\d+):\d+\)/;
        var match = stackTrace.match(lineRegex);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        return null;
    };
    Assistant.prototype.promptUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                    })];
            });
        });
    };
    return Assistant;
}(eventemitter3_1.EventEmitter));
exports.default = Assistant;
var readline_1 = __importDefault(require("readline"));
var chalk_1 = __importDefault(require("chalk"));
var rl;
var assistant = new Assistant();
assistant.on('taskId', function (taskid) {
    assistant.on("".concat(taskid, "_task"), function (chat) {
        console.log(chalk_1.default.bold.yellow('Task: ' + chat));
    });
    assistant.on("".concat(taskid, "_chat"), function (chat) {
        console.log(chalk_1.default.bold.green(chat));
    });
    assistant.on("".concat(taskid, "_script"), function (script) {
        console.log(chalk_1.default.bold.blue('Script: ' + script));
    });
    assistant.on("".concat(taskid, "_result"), function (result) {
        console.log(chalk_1.default.bold.magenta(JSON.stringify(result)));
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var chalk, highlight;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('chalk')); })];
                case 1:
                    chalk = (_a.sent()).default;
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('cli-highlight')); })];
                case 2:
                    highlight = (_a.sent()).highlight;
                    console.log(chalk.bold.yellow('AI Assistant CLI 1.0.5'));
                    setTimeout(function () {
                        rl = readline_1.default.createInterface({
                            input: process.stdin,
                            output: process.stdout,
                            prompt: chalk.bold.green('> ')
                        })
                            .on('close', function () {
                            process.exit(0);
                        });
                        rl.on('line', function (input) { return __awaiter(_this, void 0, void 0, function () {
                            var res, error_8;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, 3, 4]);
                                        return [4 /*yield*/, assistant.callAgent(input, function (text) {
                                                console.log(chalk.bold.gray(JSON.stringify(text)));
                                            })];
                                    case 1:
                                        _a.sent();
                                        res = assistant.store['result'];
                                        res.forEach(function (r) {
                                            var task = r.task, script = r.script, result = r.result;
                                            console.log(chalk.bold.yellow('Task: ' + task));
                                            console.log(chalk.bold.blue('Script: ' + script));
                                            console.log(chalk.bold.magenta(JSON.stringify(result)));
                                        });
                                        return [3 /*break*/, 4];
                                    case 2:
                                        error_8 = _a.sent();
                                        console.error(chalk.red(error_8));
                                        return [3 /*break*/, 4];
                                    case 3:
                                        rl.prompt();
                                        return [7 /*endfinally*/];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                        rl.prompt();
                    }, 100);
                    return [2 /*return*/];
            }
        });
    });
}
main().then(function () { }).catch(console.error);
//# sourceMappingURL=neo.js.map