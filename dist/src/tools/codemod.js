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
Object.defineProperty(exports, "__esModule", { value: true });
const _ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
const ts = _ts;
const codemod = function ({ filePath, operation, selectors, options = {} }, state) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            try {
                // Assume fs and ts have been imported and are available
                const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
                const sourceFile = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
                let result;
                if (operation === 'get_info') {
                    result = getSelectorNodes(sourceFile, selectors);
                }
                else if (operation === 'set_info') {
                    result = setInfo(sourceFile, selectors, options.newName);
                }
                else if (operation === 'append') {
                    result = appendCode(sourceFile, options.codeSnippet);
                }
                else if (operation === 'remove') {
                    result = removeNode(sourceFile, selectors);
                }
                else if (operation === 'replace') {
                    result = replaceNode(sourceFile, selectors, options.codeSnippet);
                }
                else {
                    resolve(`Operation '${operation}' is not supported.`);
                    return;
                }
                // Assuming the modification functions return the modified source code as a string
                fs.writeFileSync(filePath, result);
                resolve(`Operation '${operation}' completed successfully on ${filePath}.`);
            }
            catch (error) {
                // Convert any caught errors into a string message
                resolve(`Error performing operation '${operation}' on ${filePath}: ${error.message}`);
            }
        });
    });
};
function parseCodeSnippetToASTNodes(codeSnippet, expectedNodeType = null) {
    // Parse the code snippet into a temporary source file
    const snippetSourceFile = ts.createSourceFile("snippet.ts", // Temporary file name
    codeSnippet, ts.ScriptTarget.Latest, true // Set parent nodes
    );
    // Ensure the source file has statements
    if (snippetSourceFile.statements.length === 0) {
        throw new Error("No TypeScript statements found in the code snippet.");
    }
    const parsedNodes = [];
    // Iterate over all statements in the snippet
    for (const statement of snippetSourceFile.statements) {
        // If an expected node type is specified, validate each statement
        if (expectedNodeType && !ts["is" + expectedNodeType](statement)) {
            throw new Error(`Expected a ${expectedNodeType} but found a different type.`);
        }
        parsedNodes.push(statement);
    }
    return parsedNodes;
}
function safelyUpdateSourceFile(sourceFile, modifiedStatements) {
    if (!modifiedStatements.every(ts.isNode)) {
        throw new Error("Modified statements array contains invalid or undefined nodes.");
    }
    return ts.updateSourceFile(sourceFile, ts.factory.createNodeArray(modifiedStatements));
}
// Example implementations of the placeholder functions, to be expanded as needed
function appendCode(sourceFile, codeSnippet) {
    // Parse the code snippet into AST nodes
    const newNodes = parseCodeSnippetToASTNodes(codeSnippet);
    // Create a new array of statements for the modified source file
    const modifiedStatements = ts.factory.createNodeArray([...sourceFile.statements, ...newNodes]);
    // Use a printer to convert the modified AST back to a string
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printNode(ts.EmitHint.Unspecified, safelyUpdateSourceFile(sourceFile, modifiedStatements), sourceFile);
}
function removeNode(sourceFile, selector) {
    // Filter out the node based on the selector
    const modifiedStatements = sourceFile.statements.filter((statement) => {
        var _a;
        // Add more robust selector logic if needed
        return !(ts.isFunctionDeclaration(statement) && ((_a = statement.name) === null || _a === void 0 ? void 0 : _a.text) === selector);
    });
    // Ensure all nodes are valid
    if (!modifiedStatements.every((node) => node !== undefined)) {
        throw new Error("Attempted to remove a node that does not exist.");
    }
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const updatedSourceFile = safelyUpdateSourceFile(sourceFile, modifiedStatements);
    return printer.printFile(updatedSourceFile);
}
function replaceNode(sourceFile, selector, codeSnippet) {
    const parsedNodes = parseCodeSnippetToASTNodes(codeSnippet);
    // Ensure there's exactly one node for simplicit
    if (parsedNodes.length !== 1) {
        throw new Error("The code snippet must contain exactly one top-level statement for replacement.");
    }
    const replacementNode = parsedNodes[0]; // Use the first node as the replacement
    let replacementMade = false;
    const modifiedStatements = sourceFile.statements.map((statement) => {
        var _a;
        if (ts.isFunctionDeclaration(statement) && ((_a = statement.name) === null || _a === void 0 ? void 0 : _a.text) === selector) {
            replacementMade = true;
            return replacementNode; // Here is where the actual replacement happens
        }
        return statement;
    });
    if (!replacementMade) {
        throw new Error(`No node found matching selector '${selector}' for replacement.`);
    }
    // Use a temporary variable to hold the new source file structure
    let updatedSourceFile;
    updatedSourceFile = safelyUpdateSourceFile(sourceFile, modifiedStatements);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printFile(updatedSourceFile);
}
function getSelectorNodes(sourceFile, selector) {
    const nodes = [];
    ts.forEachChild((sourceFile, node) => {
        var _a, _b;
        if (ts.isFunctionDeclaration(node) && ((_a = node.name) === null || _a === void 0 ? void 0 : _a.text) === selector) {
            nodes.push(node);
        }
        else if (ts.isClassDeclaration(node) && ((_b = node.name) === null || _b === void 0 ? void 0 : _b.text) === selector) {
            nodes.push(node);
        }
        else if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((declaration) => {
                if (ts.isIdentifier(declaration.name) && declaration.name.text === selector) {
                    nodes.push(declaration);
                }
            });
        }
        else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === selector) {
            nodes.push(node);
        }
    });
    return nodes;
}
function setInfo(sourceFile, selector, newName) {
    const nodes = getSelectorNodes(sourceFile, selector);
    if (nodes.length === 0) {
        throw new Error(`No nodes found for selector '${selector}'`);
    }
    if (nodes.length > 1) {
        throw new Error(`Multiple nodes found for selector '${selector}'`);
    }
    const node = nodes[0];
    if (ts.isFunctionDeclaration(node)) {
        return replaceFunctionName(sourceFile, node, newName);
    }
    else if (ts.isClassDeclaration(node)) {
        return replaceClassName(sourceFile, node, newName);
    }
    else if (ts.isVariableDeclaration(node)) {
        return replaceVariableName(sourceFile, node, newName);
    }
    else {
        throw new Error(`Unsupported node type for selector '${selector}'`);
    }
}
function replaceFunctionName(sourceFile, node, newName) {
    const modifiedNode = ts.factory.createFunctionDeclaration(node.decorators, node.modifiers, node.asteriskToken, ts.factory.createIdentifier(newName), node.typeParameters, node.parameters, node.type, node.body);
    const modifiedStatements = sourceFile.statements.map((statement) => {
        if (statement === node) {
            return modifiedNode;
        }
        return statement;
    });
    const updatedSourceFile = safelyUpdateSourceFile(sourceFile, modifiedStatements);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printFile(updatedSourceFile);
}
function replaceClassName(sourceFile, node, newName) {
    const modifiedNode = ts.factory.createClassDeclaration(node.decorators, node.modifiers, ts.factory.createIdentifier(newName), node.typeParameters, node.heritageClauses, node.members);
    const modifiedStatements = sourceFile.statements.map((statement) => {
        if (statement === node) {
            return modifiedNode;
        }
        return statement;
    });
    const updatedSourceFile = safelyUpdateSourceFile(sourceFile, modifiedStatements);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printFile(updatedSourceFile);
}
function replaceVariableName(sourceFile, node, newName) {
    const modifiedNode = ts.factory.createVariableDeclaration(ts.factory.createIdentifier(newName), node.exclamationToken, node.type, node.initializer);
    const modifiedStatements = sourceFile.statements.map((statement) => {
        if (statement === node) {
            return modifiedNode;
        }
        return statement;
    });
    const updatedSourceFile = safelyUpdateSourceFile(sourceFile, modifiedStatements);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printFile(updatedSourceFile);
}
exports.default = {
    schema: {
        "name": "codemod",
        "description": "Automates TypeScript/JavaScript code edits via AST",
        "input_schema": {
            "type": "object",
            "properties": {
                "filePath": {
                    "type": "string",
                    "description": "The path to the TypeScript or JavaScript file to modify"
                },
                "operation": {
                    "type": "string",
                    "description": "The operation to perform (e.g., 'append', 'remove', 'replace', 'get_info', 'set_info')"
                },
                "selectors": {
                    "type": "string",
                    "description": "Selectors for identifying code parts (e.g., function names, class names)"
                },
                "options": {
                    "type": "object",
                    "properties": {
                        "codeSnippet": {
                            "type": "string",
                            "description": "Code snippet for append/replace operations"
                        },
                        "newName": {
                            "type": "string",
                            "description": "New name for the set_info operation"
                        }
                    },
                    "description": "Additional options specific to the operation"
                }
            },
            "required": ["filePath", "operation"]
        }
    },
    action: codemod,
    nextState: null
};
