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
var blessed = __importStar(require("blessed"));
var blessed_contrib_1 = __importDefault(require("blessed-contrib"));
var screen = blessed.screen();
var grid = new blessed_contrib_1.default.grid({ rows: 12, cols: 12, screen: screen });
var header = grid.set(0, 0, 1, 12, blessed.box, {
    content: 'AI Agent v1.0',
    style: {
        fg: 'white',
        bg: 'blue',
    },
});
var sidebar = grid.set(1, 0, 11, 3, blessed.box, {
    style: {
        fg: 'white',
        bg: 'gray',
    },
});
var mainContent = grid.set(1, 3, 11, 9, blessed.box, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});
var navigationMenu = grid.set(1, 0, 11, 3, blessed_contrib_1.default.tree, {
    style: {
        fg: 'white',
        bg: 'gray',
    },
    template: {
        lines: true,
    },
});
navigationMenu.setData({
    extended: true,
    children: [
        {
            name: 'New Task',
            children: [],
        },
        {
            name: 'Task History',
            children: [],
        },
        {
            name: 'Settings',
            children: [],
        },
        {
            name: 'Help',
            children: [],
        },
    ],
});
navigationMenu.on('select', function (node) {
    switch (node.name) {
        case 'New Task':
            // Display new task input in main content area
            break;
        case 'Task History':
            // Display task history in main content area
            break;
        case 'Settings':
            // Display settings in main content area
            break;
        case 'Help':
            // Display help documentation in main content area
            //helpSection.display();
            break;
    }
});
var inputBox = blessed.textbox({
    parent: mainContent,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 3,
    inputOnFocus: true,
    style: {
        fg: 'white',
        bg: 'black',
    },
});
var conversationHistory = blessed_contrib_1.default.log({
    parent: mainContent,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%-3',
    style: {
        fg: 'white',
        bg: 'black',
    },
    scrollable: true,
    scrollbar: {
        bg: 'blue',
    },
});
inputBox.on('submit', function (value) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Display loading indicator
                loadingIndicator.load();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, processTask(value)];
            case 2:
                result = _a.sent();
                // Update conversation history
                if (detailedOutput) {
                    conversationHistory.log("Task ID: ".concat(result.taskId));
                    conversationHistory.log("Chat Message: ".concat(result.chatMessage));
                    conversationHistory.log("Script: ".concat(result.script));
                }
                conversationHistory.log("Result: ".concat(result.output));
                // Display task details
                taskDetails.setMarkdown("\n### Task Details\n- Task ID: ".concat(result.taskId, "\n- Chat Message: ").concat(result.chatMessage, "\n- Script: ").concat(result.script, "\n- Output: ").concat(result.output, "\n"));
                // Clear input box
                inputBox.clearValue();
                screen.render;
                return [3 /*break*/, 5];
            case 3:
                error_1 = _a.sent();
                // Display error message
                //errorMessage.display(error.message);
                errorSection.setContent(error_1.stack);
                return [3 /*break*/, 5];
            case 4:
                // Hide loading indicator
                loadingIndicator.stop();
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
var loadingIndicator = grid.set(5, 5, 3, 3, blessed_contrib_1.default.gauge, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});
var taskDetails = grid.set(1, 3, 11, 9, blessed_contrib_1.default.markdown, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});
var progressBar = grid.set(6, 4, 1, 4, blessed_contrib_1.default.gauge, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});
var detailedOutput = true;
var toggleDetailedOutput = function () {
    detailedOutput = !detailedOutput;
    // Update conversation history display based on detailed output setting
    screen.render();
};
var errorMessage = grid.set(4, 4, 3, 4, blessed_contrib_1.default.markdown, {
    style: {
        fg: 'white',
        bg: 'red',
    },
});
var errorSection = grid.set(7, 4, 4, 4, blessed.box, {
    style: {
        fg: 'white',
        bg: 'red',
    },
});
screen.key(['C-x'], function () {
    // Handle task execution shortcut
    inputBox.focus();
    screen.render();
});
screen.key(['C-d'], toggleDetailedOutput);
screen.key(['up', 'down'], function (ch, key) {
    // Handle navigation within input textbox
    if (key.name === 'up' || key.name === 'down') {
        conversationHistory.scroll(key.name === 'up' ? -1 : 1);
        screen.render();
    }
});
screen.key(['pageup', 'pagedown'], function (ch, key) {
    // Handle scrolling through conversation history
    if (key.name === 'pageup' || key.name === 'pagedown') {
        conversationHistory.scroll(key.name === 'pageup' ? -5 : 5);
        screen.render();
    }
});
var helpSection = grid.set(1, 3, 11, 9, blessed_contrib_1.default.markdown, {
    style: {
        fg: 'white',
        bg: 'black',
    },
});
// Load help documentation into the helpSection widget
// helpSection.setMarkdown(`
// # AI Agent Help
// This is the help documentation for the AI Agent application.
// `);
var processTask = function (task) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Simulated asynchronous task processing
            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
            case 1:
                // Simulated asynchronous task processing
                _a.sent();
                // Update progress bar during task execution
                progressBar.setPercent(50);
                screen.render();
                result = {
                    taskId: 'task-123',
                    chatMessage: 'User: ' + task,
                    script: 'console.log("Hello, World!");',
                    output: 'Hello, World!',
                };
                // Update progress bar to indicate completion
                progressBar.setPercent(100);
                screen.render();
                return [2 /*return*/, result];
        }
    });
}); };
screen.render();
//# sourceMappingURL=b.js.map