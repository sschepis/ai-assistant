"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
exports.default = {
    enabled: true,
    tools: {
        sed_string: {
            schema: {
                "name": "sed_string",
                "description": "Perform sed operations on a given string",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "inputString": {
                            "type": "string",
                            "description": "The input string to be transformed"
                        },
                        "pattern": {
                            "type": "string",
                            "description": "The sed pattern to apply"
                        }
                    },
                    "required": ["inputString", "pattern"]
                }
            },
            action: ({ inputString, pattern }) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const sed = yield Promise.resolve().then(() => __importStar(require('sed-lite')));
                    return sed(inputString, pattern);
                }
                catch (err) {
                    return JSON.stringify(err.message);
                }
            })
        },
        sed_file: {
            schema: {
                "name": "sed_file",
                "description": "Perform sed operations on the contents of a file",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "filePath": {
                            "type": "string",
                            "description": "The path of the file to be transformed"
                        },
                        "pattern": {
                            "type": "string",
                            "description": "The sed pattern to apply"
                        }
                    },
                    "required": ["filePath", "pattern"]
                }
            },
            action: ({ filePath, pattern }) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    if (!fs_1.default.existsSync(filePath)) {
                        return `File not found: ${filePath}`;
                    }
                    const sed = yield Promise.resolve().then(() => __importStar(require('sed-lite')));
                    const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
                    const transformedContent = sed(fileContent, pattern);
                    fs_1.default.writeFileSync(filePath, transformedContent);
                    return `File transformed successfully.`;
                }
                catch (err) {
                    return JSON.stringify(err.message);
                }
            })
        }
    }
};
