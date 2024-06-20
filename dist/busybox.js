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
var shelljs_1 = __importDefault(require("shelljs"));
var fs_1 = __importDefault(require("fs"));
/**
 * An asynchronous function that emulates busybox behavior in JavaScript.
 *
 * @param {string} command - The command to execute (e.g., 'ls', 'cat file.txt').
 * @param {string[]} [args=[]] - An array of arguments for the command.
 * @param {object} [options={}] - Optional settings for execution.
 * @returns {Promise<string>} - The output of the command.
 * @throws {Error} - If an invalid command is provided or execution fails.
 */
function jsBusybox(_a) {
    var command = _a.command, _b = _a.args, args = _b === void 0 ? [] : _b, _c = _a.options, options = _c === void 0 ? {} : _c;
    return __awaiter(this, void 0, void 0, function () {
        var supportedCommands, cmdFunction, result, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    supportedCommands = {
                        // File system
                        'ls': function (args) {
                            if (!Array.isArray(args)) {
                                args = Object.values(args);
                            }
                            if (args.length === 0) {
                                args = ['.']; // Default to current directory
                            }
                            return shelljs_1.default.ls.apply(shelljs_1.default, args).toString();
                        },
                        'cat': function (args) {
                            if (!Array.isArray(args)) {
                                args = Object.values(args);
                            }
                            if (args.length === 0) {
                                throw new Error('cat: missing file');
                            }
                            return shelljs_1.default.cat.apply(shelljs_1.default, args).toString();
                        },
                        'pwd': function () { return shelljs_1.default.pwd().toString(); },
                        'mkdir': function (args) {
                            if (!Array.isArray(args)) {
                                args = Object.values(args);
                            }
                            if (args.length === 0) {
                                throw new Error('mkdir: missing directory');
                            }
                            return shelljs_1.default.mkdir.apply(shelljs_1.default, args);
                        },
                        'touch': function (args) {
                            if (!Array.isArray(args)) {
                                args = Object.values(args);
                            }
                            if (args.length === 0) {
                                throw new Error('touch: missing file');
                            }
                            return shelljs_1.default.touch.apply(shelljs_1.default, args);
                        },
                        'rm': function (args) {
                            if (!Array.isArray(args)) {
                                args = Object.values(args);
                            }
                            if (args.length === 0) {
                                throw new Error('rm: missing file');
                            }
                            return shelljs_1.default.rm.apply(shelljs_1.default, args);
                        },
                        'cp': function (args) { return shelljs_1.default.cp.apply(shelljs_1.default, args); },
                        'mv': function (args) { return shelljs_1.default.mv.apply(shelljs_1.default, args); },
                        // System info
                        'date': function () { return shelljs_1.default.exec('date', options).toString(); },
                        'hostname': function () { return shelljs_1.default.hostname().toString(); },
                        'whoami': function () { return shelljs_1.default.exec('whoami', options).toString(); },
                        'uptime': function () { return shelljs_1.default.exec('uptime', options).toString(); },
                        // Network
                        'ping': function (args) { return shelljs_1.default.exec("ping ".concat(args.join(' '), " -c 4"), options).toString(); },
                        // String manipulation
                        'echo': function (args) { return shelljs_1.default.echo.apply(shelljs_1.default, args).toString(); },
                        'grep': function (args) { return shelljs_1.default.grep.apply(shelljs_1.default, args).toString(); },
                        'sed': function (args) { return shelljs_1.default.sed.apply(shelljs_1.default, args).toString(); },
                        'awk': function (args) { return shelljs_1.default.exec("awk ".concat(args.join(' ')), options).toString(); },
                        // Process management (simple examples)
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
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, cmdFunction(args)];
                case 2:
                    result = _d.sent();
                    // ShellJS often returns objects with stdout/stderr, so normalize to string
                    return [2 /*return*/, result.toString ? result.toString() : result];
                case 3:
                    error_1 = _d.sent();
                    throw new Error("Error executing '".concat(command, "': ").concat(error_1.message));
                case 4: return [3 /*break*/, 6];
                case 5: throw new Error("Invalid command: '".concat(command, "'"));
                case 6: return [2 /*return*/];
            }
        });
    });
}
module.exports = { jsBusybox: jsBusybox };
exports.default = {
    schema: {
        "name": "busybox",
        "description": "A versatile function that emulates busybox behavior in JavaScript.",
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
                }
            }
        },
        "output_schema": {
            "type": "string",
            "description": "The output of the command, either as a string or Buffer."
        }
    },
    action: function (params, api) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, jsBusybox(params.command, params.args, params.options)];
        });
    }); },
};
// tests for the function
// create a test file
fs_1.default.writeFileSync('test.txt', 'Hello, world!');
var test = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                return [4 /*yield*/, jsBusybox('ls', ['-l'])];
            case 1:
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, jsBusybox('cat', ['./test.txt'])];
            case 2:
                // cat
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, jsBusybox('ping', ['google.com'])];
            case 3:
                // ping
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, jsBusybox('mkdir', ['./testdir'])];
            case 4:
                // mkdir
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, jsBusybox('rm', ['-r', './testdir'])];
            case 5:
                // rm
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, jsBusybox('cp', ['./test.txt', './test2.txt'])];
            case 6:
                // cp
                result = _a.sent();
                console.log(result);
                return [4 /*yield*/, jsBusybox('mv', ['./test2.txt', './test3.txt'])];
            case 7:
                // mv
                result = _a.sent();
                console.log(result);
                return [3 /*break*/, 9];
            case 8:
                error_2 = _a.sent();
                console.error(error_2);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
test();
