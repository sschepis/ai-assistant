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
const tools_1 = __importDefault(require("./tools"));
class Assistant {
    constructor() {
        this.state = [];
        this.history = [];
        this.tools = tools_1.default;
    }
    callLLM(persona, prompt, tools = {}, state = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('response:', prompt);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const schemas = Object.values(tools).map((tool) => tool.schema);
                const response = yield require('node-fetch')('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01',
                        'anthropic-beta': 'tools-2024-04-04',
                    },
                    body: JSON.stringify({
                        model: 'claude-3-opus-20240229',
                        max_tokens: 4000,
                        system: persona,
                        tools: schemas,
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            },
                        ],
                    }),
                });
                const data = yield response.json();
                state[prompt] = data.content;
                const result = [];
                if (Array.isArray(data.content)) {
                    yield data.content.forEach((tool, i) => __awaiter(this, void 0, void 0, function* () {
                        if (tool.type === 'text') {
                            result.push({
                                text: tool.text,
                                type: 'text'
                            });
                            return;
                        }
                        else if (tool.type === 'tool_use') {
                            const input = tool.input;
                            const toolCall = tools[tool.name];
                            if (toolCall) {
                                const action = toolCall.action;
                                try {
                                    const ret = yield action(input, state, this);
                                    result.push({
                                        text: ret,
                                        type: 'tool_use'
                                    });
                                }
                                catch (e) {
                                    result.push(JSON.stringify({ error: e.message }));
                                }
                            }
                        }
                    }));
                }
                console.log('result:', result);
                resolve(result);
            }));
        });
    }
    perform_task(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const stateCopy = JSON.parse(JSON.stringify(state));
            delete stateCopy.subtasks;
            delete stateCopy.workProducts;
            const prompt = `You are a expert in everything currently working on a technical project. You are tasked with getting the project to completion. Use your expertise and the provided tools to complete the project. USE THE notes FIELD IN THE STATE TO RECORD ANY IMPORTANT INFORMATION.

Current project state: ${JSON.stringify(stateCopy)}
Recent history: ${JSON.stringify(this.history)}
`;
            const response = yield this.callLLM(prompt, prompt, tools_1.default, state);
            return {
                work_products: response
            };
        });
    }
    review_task(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const stateCopy = JSON.parse(JSON.stringify(state));
            const prompt = `You are a expert in everything currently working on a technical project. You are tasked with getting the project to completion. Review the taskResponse and notes fields in the state for the latest work, generate a work product that represents the state of the project, set it as a work product, update the project state, removing intermediate work products. Lastly update the percent_complete field to reflect the progress made. Use your expertise and the provided tools to complete the project.

Current project state: ${JSON.stringify(stateCopy)}
Recent history: ${JSON.stringify(this.history)}
`;
            const response = yield this.callLLM(prompt, prompt, tools_1.default, state);
            return {
                work_products: response
            };
        });
    }
    send(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const initialTask = input;
            let state = {
                subtasks: {},
                completedTasks: [],
                remainingTasks: [initialTask],
                workProducts: {},
                taskResponse: {},
                currentTask: '',
                percent_complete: 0,
                notes: '',
            };
            this.state = state;
            while (state.remainingTasks.length > 0) {
                state.currentTask = this.state.remainingTasks[0];
                console.log('current task:', state.currentTask);
                const res = yield this.perform_task(state);
                state.taskResponse = res.work_products;
                yield this.review_task(state);
                if (state.remainingTasks.length === 0 || state.percent_complete === 100) {
                    console.log('No more tasks to process!');
                    break;
                }
                console.log('Work products:', res.work_products);
            }
            console.log('Final work products:', state.workProducts);
            return state.workProducts;
        });
    }
}
const assistant = new Assistant();
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
})
    .on('line', (line) => __awaiter(void 0, void 0, void 0, function* () {
    yield assistant.send(line);
    rl.prompt();
}))
    .on('close', () => {
    process.exit(0);
});
