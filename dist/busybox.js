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
Object.defineProperty(exports, "__esModule", { value: true });
var execSync = require('child_process').execSync;
/**
 * A versatile function that emulates busybox behavior in JavaScript.
 *
 * @param {string} command - The command to execute (e.g., 'ls', 'cat file.txt').
 * @param {string[]} [args=[]] - An array of arguments for the command.
 * @param {object} [options={}] - Optional settings for execution.
 * @returns {string|Buffer} - The output of the command, either as a string or Buffer.
 * @throws {Error} - If an invalid command is provided or execution fails.
 */
function jsBusybox(command, args, options) {
    if (args === void 0) { args = []; }
    if (options === void 0) { options = {}; }
    var supportedCommands = {
        // File system
        'ls': function () { return execSync("ls ".concat(args.join(' ')), options).toString().trim(); },
        'cat': function () { return execSync("cat ".concat(args.join(' ')), options).toString(); },
        'pwd': function () { return process.cwd(); },
        'mkdir': function () { return execSync("mkdir ".concat(args.join(' ')), options); },
        'touch': function () { return execSync("touch ".concat(args.join(' ')), options); },
        'rm': function () { return execSync("rm ".concat(args.join(' ')), options); },
        'cp': function () { return execSync("cp ".concat(args.join(' ')), options); },
        'mv': function () { return execSync("mv ".concat(args.join(' ')), options); },
        // System info
        'date': function () { return execSync('date', options).toString().trim(); },
        'hostname': function () { return execSync('hostname', options).toString().trim(); },
        'whoami': function () { return execSync('whoami', options).toString().trim(); },
        'uptime': function () { return execSync('uptime', options).toString().trim(); },
        // Network
        'ping': function () { return execSync("ping ".concat(args.join(' '), " -c 4"), options).toString(); },
        // String manipulation
        'echo': function () { return args.join(' '); },
        'grep': function () { return execSync("grep ".concat(args.join(' ')), options).toString(); },
        'sed': function () { return execSync("sed ".concat(args.join(' ')), options).toString(); },
        'awk': function () { return execSync("awk ".concat(args.join(' ')), options).toString(); },
        // Process management (simple examples)
        'ps': function () { return execSync('ps', options).toString(); },
        'kill': function () {
            if (args.length === 0) {
                throw new Error('kill: missing process id');
            }
            return execSync("kill ".concat(args.join(' ')), options);
        },
        // Help
        'help': function () {
            return "Available commands:\n".concat(Object.keys(supportedCommands).join('\n'));
        }
    };
    var cmdFunction = supportedCommands[command];
    if (cmdFunction) {
        try {
            return cmdFunction();
        }
        catch (error) {
            throw new Error("Error executing '".concat(command, "': ").concat(error.message));
        }
    }
    else {
        throw new Error("Invalid command: '".concat(command, "'"));
    }
}
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
