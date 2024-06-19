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
exports.Assistant = void 0;
var eventemitter3_1 = require("eventemitter3");
var store_1 = __importDefault(require("./store"));
var fs_1 = __importDefault(require("fs"));
var zod_1 = require("zod");
var Assistant = /** @class */ (function (_super) {
    __extends(Assistant, _super);
    function Assistant() {
        var _this = _super.call(this) || this;
        _this.initialState = {
            thoughts: '',
            remainingTasks: [],
            currentTask: null,
            completedTasks: [],
            percentComplete: 0,
        };
        _this.stateSchema = zod_1.z.object({
            thoughts: zod_1.z.string().optional(),
            remainingTasks: zod_1.z.array(zod_1.z.string()).optional(),
            currentTask: zod_1.z.object({
                name: zod_1.z.string(),
                workProducts: zod_1.z.array(zod_1.z.string()),
                lastResponse: zod_1.z.string().optional(),
            }).nullable(),
            completedTasks: zod_1.z.array(zod_1.z.object({
                name: zod_1.z.string(),
                workProducts: zod_1.z.array(zod_1.z.string()),
            })).default([]),
            percentComplete: zod_1.z.number().min(0).max(100).default(0),
        });
        _this.callTools = _this.callTools.bind(_this);
        _this.callTool = _this.callTool.bind(_this);
        _this.tools = {
            loadTools: {
                schema: {
                    "name": "loadTools",
                    "description": "Load tools from the tools folder.",
                    "input_schema": {
                        "type": "object",
                        "properties": {}
                    }
                },
                action: function (params, api) { return __awaiter(_this, void 0, void 0, function () {
                    var tools, _i, tools_1, tool, toolObj, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                tools = fs_1.default.readdirSync(__dirname + '/tools');
                                _i = 0, tools_1 = tools;
                                _a.label = 1;
                            case 1:
                                if (!(_i < tools_1.length)) return [3 /*break*/, 4];
                                tool = tools_1[_i];
                                return [4 /*yield*/, Promise.resolve("".concat(__dirname + "/tools/".concat(tool))).then(function (s) { return __importStar(require(s)); })];
                            case 2:
                                toolObj = (_a.sent());
                                api.tools[toolObj.default.schema.name] = toolObj.default;
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/, Object.keys(api.tools)];
                            case 5:
                                error_1 = _a.sent();
                                return [2 /*return*/, "Error loading tools: ".concat(error_1.message)];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); }
            },
            callTool: {
                schema: {
                    "name": "callTool",
                    "description": "Call a tool by name with the given parameters.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "tool": {
                                "type": "string"
                            },
                            "parameters": {
                                "type": "object"
                            }
                        },
                        "required": [
                            "tool",
                            "parameters"
                        ]
                    }
                },
                action: function (_a, api) {
                    var tool = _a.tool, parameters = _a.parameters;
                    return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_b) {
                            return [2 /*return*/, api.callTool(tool, parameters)];
                        });
                    });
                }
            },
        };
        _this.store = store_1.default;
        _this.callTool('loadTools', {}).then(console.log).catch(console.error);
        return _this;
    }
    Assistant.prototype.callTools = function (tools, state) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, tools_2, tool, toolResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, tools_2 = tools;
                        _a.label = 1;
                    case 1:
                        if (!(_i < tools_2.length)) return [3 /*break*/, 4];
                        tool = tools_2[_i];
                        if (tool.type === 'text') {
                            this.emit('text', tool.text);
                            results.push(tool.text);
                            return [3 /*break*/, 3];
                        }
                        tool.command = tool.command || tool.name;
                        tool.parameters = tool.params || tool.parameters;
                        this.emit('log', "Calling tool: ".concat(tool.command, " with parameters: ").concat(JSON.stringify(tool.parameters)));
                        return [4 /*yield*/, this.callTool(tool.name, tool.parameters)];
                    case 2:
                        toolResult = _a.sent();
                        this.emit('log', "Tool response: ".concat(toolResult));
                        results.push(toolResult);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    Assistant.prototype.callTool = function (toolName, params) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.tools[toolName].action(params, this)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    Assistant.prototype.callAgent = function (input, onUpdate) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var chalk, boxen, task, response, nextAction, error_2, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('chalk')); })];
                    case 1:
                        chalk = (_b.sent()).default;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('boxen')); })];
                    case 2:
                        boxen = (_b.sent()).default;
                        this.on('text', onUpdate);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 12, , 13]);
                        store_1.default.setState({
                            thoughts: '',
                            completedTasks: [],
                            remainingTasks: [input],
                            currentTask: { name: input, workProducts: [] },
                            percentComplete: 0
                        });
                        _b.label = 4;
                    case 4:
                        if (!(store_1.default.getState().remainingTasks.length > 0)) return [3 /*break*/, 11];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 9, , 10]);
                        task = (_a = store_1.default.getState().currentTask) === null || _a === void 0 ? void 0 : _a.name;
                        if (!task)
                            return [3 /*break*/, 11];
                        this.emit('text', chalk.bold.blue("Performing task: ".concat(task)));
                        return [4 /*yield*/, this.callTool('performTask', { task: task })];
                    case 6:
                        response = _b.sent();
                        response = Array.isArray(response) ? response.join(' ') : response;
                        this.emit('text', chalk.green("".concat(boxen(JSON.stringify(response), { padding: 1 }))));
                        store_1.default.getState().setCurrentTaskResponse(response);
                        store_1.default.getState().addWorkProductToCurrentTask(response);
                        if (store_1.default.getState().percentComplete === 100) {
                            if (store_1.default.getState().remainingTasks.length === 0) {
                                return [3 /*break*/, 11];
                            }
                        }
                        return [4 /*yield*/, this.callTool('reviewWorkProducts', {})];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, this.callTool('decideNextAction', {})];
                    case 8:
                        nextAction = _b.sent();
                        if (nextAction === 'Session completed.') {
                            return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _b.sent();
                        console.error(chalk.red(error_2));
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 4];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_3 = _b.sent();
                        console.error(chalk.red(error_3));
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return Assistant;
}(eventemitter3_1.EventEmitter));
exports.Assistant = Assistant;
var readline_1 = __importDefault(require("readline"));
var rl;
var assistant = new Assistant();
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
                    console.log(chalk.bold.yellow('AI Assistant CLI 1.0.0'));
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
                            var error_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, 3, 4]);
                                        return [4 /*yield*/, assistant.callAgent(input, function (text) {
                                                var lines = text.split('\n');
                                                lines.forEach(function (line) { return console.log(highlight(line, { ignoreIllegals: true })); });
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        error_4 = _a.sent();
                                        console.error(chalk.red(error_4));
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
