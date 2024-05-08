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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jscodeshift_1 = __importDefault(require("jscodeshift"));
const fs_1 = __importDefault(require("fs"));
module.exports = {
    enabled: true,
    tools: {
        transform_file: {
            schema: {
                "type": "function",
                "function": {
                    "name": "transform_file",
                    "description": "Apply a custom transformation to a JavaScript or TypeScript file",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "filePath": {
                                "type": "string",
                                "description": "The path to the source code file to transform"
                            },
                            "transformationFilePath": {
                                "type": "string",
                                "description": "The path to the file containing the transformation code"
                            }
                        },
                        "required": ["filePath", "transformationFilePath"]
                    }
                }
            },
            action: ({ filePath, transformationFilePath }) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    if (!fs_1.default.existsSync(filePath) || !fs_1.default.existsSync(transformationFilePath)) {
                        return `File not found.`;
                    }
                    const sourceCode = fs_1.default.readFileSync(filePath, 'utf8');
                    const transformationCode = fs_1.default.readFileSync(transformationFilePath, 'utf8');
                    const j = jscodeshift_1.default.withParser('babel'); // or 'tsx' for TypeScript
                    const root = j(sourceCode);
                    // Evaluate the transformation code and apply it
                    const transformation = new Function('j', 'root', transformationCode);
                    transformation(j, root);
                    // Optionally write back to the same file or a new file
                    fs_1.default.writeFileSync(filePath, root.toSource());
                    return `Transformation applied successfully.`;
                }
                catch (err) {
                    return JSON.stringify(err.message);
                }
            })
        },
        // Additional tools for specific file-based transformations can be defined here.
    }
};
exports.default = module.exports;
