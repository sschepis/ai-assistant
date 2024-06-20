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
        "name": "generateTool",
        "description": "Generate a software tool based on the provided task, and return the generated function as a string",
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string"
                }
            },
            "required": [
                "task",
                "format"
            ]
        },
        "output_schema": {
            "type": "string"
        }
    },
    action: function (_a, api) {
        var task = _a.task;
        return __awaiter(void 0, void 0, void 0, function () {
            var state, results, nextAction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('Generating tool...');
                        state = store_1.default.getState();
                        return [4 /*yield*/, api.callTool('callLLM', {
                                prompt: "Generate a software function that accomplishes the given task. The software function should be generated using the below format:\n\n{\nschema: {\n\"name\": \"eval\",\n\"description\": \"Evaluate a JavaScript expression and return its result\",\n\"input_schema\": {\n\"type\": \"object\",\n\"properties\": {\n    \"expression\": {\n        \"type\": \"string\"\n    }\n},\n\"required\": [\n    \"expression\"\n]\n},\n\"output_schema\": {\n\"type\": \"any\"\n}\n},\naction: async ({ expression }: any) => {\ntry {\nreturn eval(expression);\n} catch (error: any) {\nreturn `Error evaluating JavaScript expression: ${error.message}`;\n}\n},\n}\n\nThe task is: \"".concat(task, "\"\n\nOutput ONLY THE RAW OUTPUT STARTING WITH { and ENDING WITH } WITHOUT ANY COMMENTARY"),
                                instructions: "Your goal is to generate a software tool using Javascript that fulfills the requirements you are given. This tool is being generated in response to an arising need in the course of implementing a projject with the following state, provided for your reference. The current project state is: ".concat(JSON.stringify(state)),
                                tools: Object.keys(api.tools).map(function (toolName) { return api.tools[toolName].schema; })
                            })];
                    case 1:
                        results = _b.sent();
                        nextAction = results[0].text || results[0];
                        console.log("Next action: ".concat(nextAction));
                        return [2 /*return*/, nextAction];
                }
            });
        });
    }
};
//# sourceMappingURL=generateTool.js.map