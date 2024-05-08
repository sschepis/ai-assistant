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
const codemod_1 = __importDefault(require("./codemod"));
const evm_1 = __importDefault(require("./evm"));
const generate_image_1 = __importDefault(require("./generate_image"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const cli_highlight_1 = require("cli-highlight");
const select_1 = __importDefault(require("./select"));
const sed_1 = __importDefault(require("./sed"));
let out = Object.assign(Object.assign(Object.assign({ codemod: codemod_1.default }, Object.values(sed_1.default.tools)), Object.values(evm_1.default.tools)), { generate_image: generate_image_1.default,
    select: select_1.default });
const baseTools = Object.assign(Object.assign({}, out), { "codemod": codemod_1.default, "bash": {
        schema: { "name": "bash", "description": "Run a bash command", "input_schema": { "type": "object", "properties": { "command": { "type": "string" }, "args": { "type": "array" } } } },
        action: (params, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            const { exec } = child_process_1.default;
            const command = params.command;
            const args = params.args || [];
            return new Promise((resolve, reject) => {
                exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
                    if (error) {
                        return reject(`error: ${error.message}`);
                    }
                    if (stderr) {
                        return reject(`stderr: ${stderr}`);
                    }
                    if (!stdout || stdout.trim().length === 0) {
                        stdout = `Command ${command} executed successfully.`;
                    }
                    resolve(stdout);
                });
            });
        }),
        nextState: null
    }, "cwd": {
        schema: { "name": "cwd", "description": "Get the current working directory", "input_schema": { "type": "object", "properties": {} } },
        action: (params, state, api) => __awaiter(void 0, void 0, void 0, function* () { return process.cwd(); }),
    }, "set_cwd": {
        schema: { "name": "set_cwd", "description": "Set the current working directory", "input_schema": { "type": "object", "properties": { "path": { "type": "string" } }, "required": ["path"] } },
        action: (params, state, api) => __awaiter(void 0, void 0, void 0, function* () { process.chdir(params.path); return process.cwd(); }),
    }, "install_tool": {
        schema: { "name": "install_tool", "description": "Install a tool", "input_schema": { "type": "object", "properties": { "sourceCode": { "type": "string", "description": "The source code of the tool" }, "name": { "type": "string", "description": "The name of the tool" } }, "required": ["sourceCode", "name"] } },
        action: ({ sourceCode, name }, state, api) => __awaiter(void 0, void 0, void 0, function* () { api.installDynamicTool(sourceCode, name); return `Tool ${name} installed.`; }),
    }, "eval": {
        schema: { "name": "eval", "description": "Evaluate a JavaScript expression", "input_schema": { "type": "object", "properties": { "expression": { "type": "string" } } } },
        action: (params, state, api) => __awaiter(void 0, void 0, void 0, function* () { return eval(params.expression); }),
    }, "set_tasks": {
        schema: { "name": "set_tasks", "description": "Set a list of tasks to be completed. Replaces previous list and resets the current task.", "input_schema": { "type": "object", "properties": { "items": { "type": "array", "items": { "type": "string" } } } } },
        action: ({ items }, state, api) => __awaiter(void 0, void 0, void 0, function* () { api.setTasks(items); return `Tasks set: ${items.join(', ')}`; }),
    }, "add_tasks": {
        schema: { "name": "add_tasks", "description": "Add a list of tasks to the current list of tasks.", "input_schema": { "type": "object", "properties": { "items": { "type": "array", "items": { "type": "string" } } } } },
        action: ({ items }, state, api) => __awaiter(void 0, void 0, void 0, function* () { items.forEach((item) => api.addTasks(item)); return `Tasks added: ${items.join(', ')}`; }),
    }, "read": {
        schema: { "name": "read", "description": "Read a file or folder", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file or folder to read" } }, "required": ["path"] } },
        action: ({ path }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (!state.files)
                    state.files = {};
                const stats = yield fs_1.default.promises.stat(path);
                if (stats.isDirectory()) {
                    const files = yield fs_1.default.promises.readdir(path);
                    return JSON.stringify(files);
                }
                return yield fs_1.default.promises.readFile(path, 'utf8');
            }
            catch (error) {
                return JSON.stringify(error);
            }
        }),
    }, "write": {
        schema: { "name": "write", "description": "Write a file", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file to write" }, "content": { "type": "string", "description": "The content to write to the file" } }, "required": ["path", "content"] } },
        action: ({ path, content }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield fs_1.default.promises.writeFile(path, content);
                return JSON.stringify('File written');
            }
            catch (error) {
                return JSON.stringify(error);
            }
        }),
    }, "replace": {
        schema: { "name": "replace", "description": "Replace a string in a file", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file to write" }, "search": { "type": "string", "description": "The string to search for" }, "replace": { "type": "string", "description": "The string to replace the search string with" } }, "required": ["path", "search", "replace"] } },
        action: ({ path, search, replace }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const content = yield fs_1.default.promises.readFile(path, 'utf8');
                const newContent = content.replace(search, replace);
                yield fs_1.default.promises.writeFile(path, newContent);
                return JSON.stringify('String replaced');
            }
            catch (error) {
                return JSON.stringify(error);
            }
        }),
    }, "status_update": {
        schema: { "name": "status_update", "description": "Send a status update to the user along with a percent_complete estimation. valid update data types are `markdown`, 'text`, `html`, and `javascript`", "input_schema": { "type": "object", "properties": { "percent_complete": { "type": "number" }, "content": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
        action: ({ content, percent_complete }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            const para = [];
            {
                if (!Array.isArray(content))
                    content = [{
                            type: 'text',
                            data: content
                        }];
            }
            content && content.forEach((element) => {
                if (element.type === 'markdown') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'markdown', ignoreIllegals: true }));
                    });
                }
                if (element.type === 'text') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'text', ignoreIllegals: true }));
                    });
                }
                if (element.type === 'html') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'html', ignoreIllegals: true }));
                    });
                }
                if (element.type === 'javascript') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'javascript', ignoreIllegals: true }));
                    });
                }
            });
            api.percent_complete = percent_complete;
        }),
    }, "submit_work_products": {
        schema: { "name": "submit_work_products", "description": "Complete the task by submitting the work products, returning to the user your response to their query. valid response types are `markdown`, 'text`, `html`, and `javascript`", "input_schema": { "type": "object", "properties": { "content": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
        action: ({ content }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            content = content.replaceAll('<antml:item type="markdown">', '').replaceAll('</antml:item>', '');
            if (!Array.isArray(content)) {
                content = [{
                        type: 'text',
                        data: content
                    }];
            }
            content && content.forEach((element) => {
                if (element.type === 'markdown') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'markdown', ignoreIllegals: true }));
                    });
                }
                if (element.type === 'text') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'text', ignoreIllegals: true }));
                    });
                }
                if (element.type === 'html') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'html', ignoreIllegals: true }));
                    });
                }
                if (element.type === 'javascript') {
                    Object.values(element.data).forEach((item) => {
                        console.log((0, cli_highlight_1.highlight)(item.text, { language: 'javascript', ignoreIllegals: true }));
                    });
                }
            });
            api.percent_complete = 100;
            return `Task completed`;
        }),
    }, "get_state": {
        schema: { "name": "get_state", "description": "Get a state object by key or a list of keys", "input_schema": { "type": "object", "properties": { "keys": { "type": "array", "items": { "type": "string" } } }, "required": ["keys"] } },
        action: ({ keys }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            if (!keys) {
                return JSON.stringify(state);
            }
            const result = {};
            keys.forEach((key) => { result[key] = state[key]; });
            return JSON.stringify(result);
        }),
    }, "set_state": {
        schema: { "name": "set_state", "description": "Set a state object by key", "input_schema": { "type": "object", "properties": { "key": { "type": "string" }, "value": { "type": "string" } }, "required": ["key", "value"] } },
        action: ({ key, value }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            state[key] = value;
            return JSON.stringify(state);
        }),
        nextState: null
    }, 'decompose_task': {
        schema: { "name": "decompose_task", "description": "Decompose a task into a list of subtasks. Returns input task if it cannot be decomposed further", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" } }, "required": ["task"] } },
        action: ({ task }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            const myTools = api.tools;
            delete myTools.decompose_task;
            myTools.submit_decomposed_tasks = {
                schema: { "name": "submit_decomposed_tasks", "description": "Submit the decomposed tasks", "input_schema": { "type": "object", "properties": { "subtasks": { "type": "array", "items": { "type": "object", "properties": { "task": { "type": "string" }, "work_product": { "type": "string" } } } } } } },
                action: ({ subtasks }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
                    subtasks.forEach((subtask) => {
                        state.remainingTasks.unshift(subtask.task);
                        state.workProducts[subtask.task] = subtask.work_product;
                    });
                    state.remainingTasks.shift();
                    state.currentTask = state.remainingTasks[0];
                    return JSON.stringify(subtasks);
                })
            };
            const prompt = `Decompose task "${task}" into a list of subtasks that can each be performed in one session by you given your current tooling, then submit them using \`submit_decomposed_tasks\`. If the input task can already be accomplished in one session by you given your current tooling, then call \`submit_decomposed_tasks\`. with it without decomposing it.  Each subtask you create MUST have a CLEAR GOAL or WELL-DEFINED WORK PRODUCT and MUST be performable by you in a single session.`;
            let subtasks = yield api.callLLM(prompt, prompt, api.tools, state);
            subtasks = subtasks.map((subtask) => JSON.parse(subtask));
            state['subtasks'][task] = subtasks.map((subtask) => subtask.task);
            return `subtasks created: ${subtasks.map((subtask) => subtask.task).join(', ')}`;
        })
    }, 'perform_task': {
        schema: { "name": "perform_task", "description": "Perform a task and submit the generated work products result from the performed work.", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" } }, "required": ["task"] } },
        action: ({ task }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            const myTools = api.tools;
            delete myTools.perform_task;
            myTools.submit_work_products = {
                schema: { "name": "submit_work_products", "description": "Complete the task by submitting the work products, returning to the user your response to their query. valid response types are `markdown`, 'text`, `html`, and `javascript`.", "input_schema": { "type": "object", "properties": { "work_products": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
                action: ({ subtasks }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
                    subtasks.forEach((subtask) => {
                        state.remainingTasks.unshift(subtask.task);
                        state.workProducts[subtask.task] = subtask.work_product;
                    });
                    state.remainingTasks.shift();
                    state.currentTask = state.remainingTasks[0];
                    return JSON.stringify(subtasks);
                })
            };
            const prompt = `Given the current state: ${JSON.stringify(state)} and the task: ${task}, use the tools at your disposal to perform the task in its entirety to the best of your ability, returning the task's relevant completion work products using the \`status_update\` tool.`;
            const results = yield api.callLLM(prompt, prompt, baseTools, state);
            state.workProducts[task] = results;
            return JSON.stringify(results);
        })
    }, "pick_next_task": {
        schema: { "name": "pick_next_task", "description": "Pick the next task to work on from the list of incomplete tasks.", "input_schema": { "type": "object", "properties": {} } },
        action: ({ task }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            const incompleteTasks = state.remainingTasks;
            const completeTasks = state.completedTasks;
            const prompt = `Given the list of complete tasks: ${JSON.stringify(completeTasks)} incomplete tasks: ${JSON.stringify(incompleteTasks)} and the overall task of ${task}, determine the next task to work on. RETURN ONLY JSON-FORMATTED DATA IN THE FOLLOWING FORMAT: { "task": "task_name" }`;
            const pickedtask = JSON.parse(api.callLLM(prompt, prompt, {}, state));
            return `next task picked: ${pickedtask.task}`;
        })
    }, "set_current_task": {
        schema: { "name": "set_current_task", "description": "Set the current task to the specified task", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to set as the current task" } }, "required": ["task"] } },
        action: ({ task }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            state.currentTask = task;
            return `current task set to: ${task}`;
        })
    }, 'complete_task': {
        schema: { "name": "complete_task", "description": "Mark a task as complete", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to mark as complete" }, "work_products": { "type": "array", "description": "The work products for the task" } }, "required": ["task", "work_products"] } },
        action: ({ task, work_products }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            state.completedTasks.push(task);
            state.remainingTasks.shift();
            if (state.remainingTasks.length > 0)
                state.currentTask = state.remainingTasks[0];
            else
                state.currentTask = '';
            if (work_products) {
                state.workProducts[task] = work_products;
            }
            return JSON.stringify({ task: task, work_products: work_products });
        })
    }, "say_aloud": {
        schema: {
            "name": "say_aloud",
            "description": "Say the text using text-to-speech",
            "input_schema": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The text to say"
                    },
                    "voice": {
                        "type": "string",
                        "description": "The voice to use (can be 'male' or 'female'). If not specified, the default female voice will be used"
                    }
                },
                "required": ["text"]
            }
        },
        action: ({ text, voice }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
            const PlayHT = yield Promise.resolve().then(() => __importStar(require('playht')));
            const player = (yield Promise.resolve().then(() => __importStar(require('play-sound'))))((error) => {
                if (error)
                    console.error('Error playing sound:', error);
            });
            const apiKey = process.env.PLAYHT_AUTHORIZATION;
            const userId = process.env.PLAYHT_USER_ID;
            const maleVoice = process.env.PLAYHT_MALE_VOICE;
            const femaleVoice = process.env.PLAYHT_FEMALE_VOICE;
            if (!voice)
                voice = process.env.PLAYHT_FEMALE_VOICE;
            if (!apiKey || !userId || !maleVoice || !femaleVoice) {
                const missing = [];
                if (!apiKey)
                    missing.push('playHT.apiKey');
                if (!userId)
                    missing.push('playHT.userId');
                if (!maleVoice)
                    missing.push('playHT.maleVoice');
                if (!femaleVoice)
                    missing.push('playHT.femaleVoice');
                return `Missing configuration: ${missing.join(', ')} in configuration file. Please ask the user to provide the missing configuration using the ask_for_data tool.`;
            }
            PlayHT.init({ apiKey: apiKey, userId: userId, });
            function getNonce() {
                return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            }
            function speakSentence(sentence, voice) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!sentence)
                        return;
                    const stream = yield PlayHT.stream(sentence, {
                        voiceEngine: "PlayHT2.0-turbo",
                        voiceId: voice === 'male' ? maleVoice : femaleVoice,
                    });
                    const chunks = [];
                    stream.on("data", (chunk) => chunks.push(chunk));
                    //console.log(`${sentence}`);
                    return new Promise((resolve, reject) => {
                        stream.on("end", () => {
                            const buf = Buffer.concat(chunks);
                            // save the audio to a file
                            const filename = `${getNonce()}.mp3`;
                            fs_1.default.writeFileSync(filename, buf);
                            player.play(filename, function (err) {
                                fs_1.default.unlinkSync(filename);
                                resolve(`done`);
                            });
                        });
                    });
                });
            }
            let sentenceSplit = yield api.callLLM(`You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. 
                **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**
                This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. 
                For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'
                When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.
                **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**`, [{ role: "user", content: text }], (e) => { }, false);
            sentenceSplit = JSON.parse(sentenceSplit.choices[0].message.content);
            const sentences = sentenceSplit.fragments;
            // split the text into sentences
            const consumeSentence = () => __awaiter(void 0, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    const loop = () => __awaiter(void 0, void 0, void 0, function* () {
                        const sentence = sentences.shift();
                        if (!sentence)
                            return resolve('done');
                        yield speakSentence(sentence, voice);
                        return yield loop();
                    });
                    return loop();
                });
            });
            yield consumeSentence();
            return text;
        }),
        nextState: null
    } });
exports.default = baseTools;
