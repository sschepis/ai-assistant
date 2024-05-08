import codemod from './codemod';
import evm from './evm';
import generate_image from './generate_image';
import fs from 'fs';
import child_process from 'child_process';
import jscodeshift from 'jscodeshift';
import { highlight } from 'cli-highlight';
import select from './select';
import sed from './sed';


let out = {
    codemod,
    ...Object.values(sed.tools),
    ...Object.values(evm.tools),
    generate_image,
    select,
}

const baseTools = {
    ...out,
    "codemod": codemod,
    "bash": {
        schema: { "name": "bash", "description": "Run a bash command", "input_schema": { "type": "object", "properties": { "command": { "type": "string" }, "args": { "type": "array" } } } },
        action: async (params: { command: any; args: any[]; }, state: any, api: any) => {
            const { exec } = child_process;
            const command = params.command;
            const args = params.args || [];
            return new Promise((resolve, reject) => {
                exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
                    if (error) { return reject(`error: ${error.message}`); }
                    if (stderr) { return reject(`stderr: ${stderr}`); }
                    if(!stdout || stdout.trim().length === 0) {
                        stdout = `Command ${command} executed successfully.`;
                    }
                    resolve(stdout);
                });
            });
        },
        nextState: null
    },
    "cwd": {
        schema: { "name": "cwd", "description": "Get the current working directory", "input_schema": { "type": "object", "properties": {} } },
        action: async (params: any, state: any, api: any) => { return process.cwd(); },
    },
    "set_cwd":  {
        schema: { "name": "set_cwd", "description": "Set the current working directory", "input_schema": { "type": "object", "properties": { "path": { "type": "string" } }, "required": ["path"] } },
        action: async (params: any, state: any, api: any) => { process.chdir(params.path); return process.cwd(); },
    },
    "install_tool": {
        schema: { "name": "install_tool", "description": "Install a tool", "input_schema": { "type": "object", "properties": { "sourceCode": { "type": "string", "description": "The source code of the tool" }, "name": { "type": "string", "description": "The name of the tool" } }, "required": ["sourceCode", "name"] } },
        action: async ({ sourceCode, name }: any, state: any, api: any) => { api.installDynamicTool(sourceCode, name); return `Tool ${name} installed.`; },
    },
    "eval": {
        schema: { "name": "eval", "description": "Evaluate a JavaScript expression", "input_schema": { "type": "object", "properties": { "expression": { "type": "string" } } } },
        action: async (params: { expression: string; }, state: any, api: any) => { return eval(params.expression); },
    },
    "set_tasks": {
        schema: { "name": "set_tasks", "description": "Set a list of tasks to be completed. Replaces previous list and resets the current task.", "input_schema": { "type": "object", "properties": { "items": { "type": "array", "items": { "type": "string" } } } } },
        action: async ({ items }: any, state: any, api: any) => { api.setTasks(items); return `Tasks set: ${items.join(', ')}`; },
    },
    "add_tasks": {
        schema: { "name": "add_tasks", "description": "Add a list of tasks to the current list of tasks.", "input_schema": { "type": "object", "properties": { "items": { "type": "array", "items": { "type": "string" } } } } },
        action: async ({ items }: any, state: any, api: any) => { items.forEach((item: any) => api.addTasks(item)); return `Tasks added: ${items.join(', ')}`;  },
    },
    "read": {
        schema: { "name": "read", "description": "Read a file or folder", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file or folder to read" } }, "required": ["path"] } },
        action: async ({ path }: any, state: { files: { [x: string]: string; }; }, api: any) => {
            try {
                if (!state.files) state.files = {};
                const stats = await fs.promises.stat(path);
                if (stats.isDirectory()) {
                    const files = await fs.promises.readdir(path);
                    return JSON.stringify(files);
                }
                return await fs.promises.readFile(path, 'utf8');
            } catch (error) {
                return JSON.stringify(error);
            }
        },
    },
    "write": {
        schema: { "name": "write", "description": "Write a file", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file to write" }, "content": { "type": "string", "description": "The content to write to the file" } }, "required": ["path", "content"] } },
        action: async ({ path, content }: any, state: any, api: any) => {
            try {
                await fs.promises.writeFile(path, content);
                return JSON.stringify('File written');
            } catch (error) {
                return JSON.stringify(error);
            }
        },
    },
    "replace": {
        schema: { "name": "replace", "description": "Replace a string in a file", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file to write" }, "search": { "type": "string", "description": "The string to search for" }, "replace": { "type": "string", "description": "The string to replace the search string with" } }, "required": ["path", "search", "replace"] } },
        action: async ({ path, search, replace }: any, state: any, api: any) => {
            try {
                const content = await fs.promises.readFile(path, 'utf8');
                const newContent = content.replace(search, replace);
                await fs.promises.writeFile(path, newContent);
                return JSON.stringify('String replaced');
            } catch (error) {
                return JSON.stringify(error);
            }
        },
    },
    "status_update": {
        schema: { "name": "status_update", "description": "Send a status update to the user along with a percent_complete estimation. valid update data types are `markdown`, 'text`, `html`, and `javascript`", "input_schema": { "type": "object", "properties": { "percent_complete": { "type": "number" }, "content": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
        action: async ({ content, percent_complete }: any, state: any, api: { percent_complete: any; }) => {
            const para: any = []; {
            if (!Array.isArray(content))
                content = [{
                    type: 'text',
                    data: content
                }];
            }
            content && content.forEach((element: { type: string; data: any; }) => {
                if (element.type === 'markdown') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'markdown', ignoreIllegals: true}))

                    });
                }
                if (element.type === 'text') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'text', ignoreIllegals: true}))
                    });
                }
                if (element.type === 'html') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'html', ignoreIllegals: true}))
                    });
                }
                if (element.type === 'javascript') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'javascript', ignoreIllegals: true}))
                    });
                }
            });
            api.percent_complete = percent_complete;
        },
    },
    "submit_work_products": {
        schema: { "name": "submit_work_products", "description": "Complete the task by submitting the work products, returning to the user your response to their query. valid response types are `markdown`, 'text`, `html`, and `javascript`", "input_schema": { "type": "object", "properties": { "content": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
        action: async ({ content }: any, state: any, api: { percent_complete: number; }) => {
            content = content.replaceAll('<antml:item type="markdown">', '').replaceAll('</antml:item>', '');
            if (!Array.isArray(content)) {
                content = [{
                    type: 'text',
                    data: content
                }];
            }
            content && content.forEach((element:any) => {
                if (element.type === 'markdown') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'markdown', ignoreIllegals: true}))
                    });
                }
                if (element.type === 'text') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'text', ignoreIllegals: true}))
                    });
                }
                if (element.type === 'html') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'html', ignoreIllegals: true}))
                    });
                }
                if (element.type === 'javascript') {
                    Object.values(element.data).forEach((item: any) => {
                        console.log(highlight(item.text, {language: 'javascript', ignoreIllegals: true}))
                    });
                }
            });
            api.percent_complete = 100;
            return `Task completed`;
        },
    },
    "get_state": {
        schema: { "name": "get_state", "description": "Get a state object by key or a list of keys", "input_schema": { "type": "object", "properties": { "keys": { "type": "array", "items": { "type": "string" } } }, "required": ["keys"] } },
        action: async ({ keys }: any, state: { [x: string]: any; }, api: any) => {
            if (!keys) { return JSON.stringify(state); }
            const result: any = {};
            keys.forEach((key: string | number) => { result[key] = state[key]; });
            return JSON.stringify(result);
        },
    },
    "set_state": {
        schema: { "name": "set_state", "description": "Set a state object by key", "input_schema": { "type": "object", "properties": { "key": { "type": "string" }, "value": { "type": "string" } }, "required": ["key", "value"] } },
        action: async ({ key, value }: any, state: { [x: string]: any; }, api: any) => {
            state[key] = value;
            return JSON.stringify(state);
        },
        nextState: null
    },
    'decompose_task': {
        schema: { "name": "decompose_task", "description": "Decompose a task into a list of subtasks. Returns input task if it cannot be decomposed further", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" } }, "required": ["task"] } },
        action: async ({task}, state: any, api: any) => {
            const myTools = api.tools;
            delete myTools.decompose_task;
            myTools.submit_decomposed_tasks = {
                schema: { "name": "submit_decomposed_tasks", "description": "Submit the decomposed tasks", "input_schema": { "type": "object", "properties": { "subtasks": { "type": "array", "items": { "type": "object", "properties": { "task": { "type": "string" }, "work_product": { "type": "string" } } } } } } },
                action: async ({ subtasks }: any, state: any, api: any) => {
                    subtasks.forEach((subtask: any) => {
                        state.remainingTasks.unshift(subtask.task);
                        state.workProducts[subtask.task] = subtask.work_product;
                    });
                    state.remainingTasks.shift();
                    state.currentTask = state.remainingTasks[0];
                    return JSON.stringify(subtasks);
                }
            }
            const prompt = `Decompose task "${task}" into a list of subtasks that can each be performed in one session by you given your current tooling, then submit them using \`submit_decomposed_tasks\`. If the input task can already be accomplished in one session by you given your current tooling, then call \`submit_decomposed_tasks\`. with it without decomposing it.  Each subtask you create MUST have a CLEAR GOAL or WELL-DEFINED WORK PRODUCT and MUST be performable by you in a single session.`;
            let subtasks = await api.callLLM(prompt, prompt, api.tools, state);
            subtasks = subtasks.map((subtask: any) => JSON.parse(subtask));
            state['subtasks'][task] = subtasks.map((subtask: any) => subtask.task);
            return `subtasks created: ${subtasks.map((subtask: any) => subtask.task).join(', ')}`;
        }
    },
    'perform_task': {
        schema: { "name": "perform_task", "description": "Perform a task and submit the generated work products result from the performed work.", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" } }, "required": ["task"] } },
        action: async ({ task }, state: any, api: any) => {
            const myTools = api.tools;
            delete myTools.perform_task;
            myTools.submit_work_products = {
                schema: { "name": "submit_work_products", "description": "Complete the task by submitting the work products, returning to the user your response to their query. valid response types are `markdown`, 'text`, `html`, and `javascript`.", "input_schema": { "type": "object", "properties": { "work_products": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
                action: async ({ subtasks }: any, state: any, api: any) => {
                    subtasks.forEach((subtask: any) => {
                        state.remainingTasks.unshift(subtask.task);
                        state.workProducts[subtask.task] = subtask.work_product;
                    });
                    state.remainingTasks.shift();
                    state.currentTask = state.remainingTasks[0];
                    return JSON.stringify(subtasks);
                }
            }
            const prompt = `Given the current state: ${JSON.stringify(state)} and the task: ${task}, use the tools at your disposal to perform the task in its entirety to the best of your ability, returning the task's relevant completion work products using the \`status_update\` tool.`;
            const results = await api.callLLM(prompt, prompt, baseTools, state);
            state.workProducts[task] = results;
            return JSON.stringify(results);
        }
    },
    "pick_next_task": {
        schema: { "name": "pick_next_task", "description": "Pick the next task to work on from the list of incomplete tasks.", "input_schema": { "type": "object", "properties": {} } },
        action: async ({task}, state, api) => {
            const incompleteTasks = state.remainingTasks;
            const completeTasks = state.completedTasks;
            const prompt = `Given the list of complete tasks: ${JSON.stringify(completeTasks)} incomplete tasks: ${JSON.stringify(incompleteTasks)} and the overall task of ${task}, determine the next task to work on. RETURN ONLY JSON-FORMATTED DATA IN THE FOLLOWING FORMAT: { "task": "task_name" }`;
            const pickedtask = JSON.parse( api.callLLM(prompt, prompt, {}, state) );
            return `next task picked: ${pickedtask.task}`
        }
    },
    "set_current_task": {
        schema: { "name": "set_current_task", "description": "Set the current task to the specified task", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to set as the current task" } }, "required": ["task"] } },
        action: async ({task}, state, api) => {
            state.currentTask = task;
            return `current task set to: ${task}`;
        }
    },
    'complete_task': {
        schema: { "name": "complete_task", "description": "Mark a task as complete", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to mark as complete" }, "work_products": { "type": "array", "description": "The work products for the task" } }, "required": ["task", "work_products"] } },
        action: async ({ task, work_products }, state: any, api: any) => {
            
            state.completedTasks.push(task);
            state.remainingTasks.shift();
            if(state.remainingTasks.length > 0) state.currentTask = state.remainingTasks[0];
            else state.currentTask = '';

            if (work_products) { state.workProducts[task] = work_products; }
            return JSON.stringify({ task: task, work_products: work_products });
        }
    },
    "say_aloud": {
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
        action: async ({ text, voice }: any, state: any, api: any) => {
            const PlayHT = await import('playht');
            const player = (await import('play-sound') as any)((error: any) => {
                if (error) console.error('Error playing sound:', error);
            });
            const apiKey = process.env.PLAYHT_AUTHORIZATION;
            const userId = process.env.PLAYHT_USER_ID;
            const maleVoice = process.env.PLAYHT_MALE_VOICE;
            const femaleVoice = process.env.PLAYHT_FEMALE_VOICE;
            if (!voice) voice = process.env.PLAYHT_FEMALE_VOICE;
            if (!apiKey || !userId || !maleVoice || !femaleVoice) {
                const missing = [];
                if (!apiKey) missing.push('playHT.apiKey');
                if (!userId) missing.push('playHT.userId');
                if (!maleVoice) missing.push('playHT.maleVoice');
                if (!femaleVoice) missing.push('playHT.femaleVoice');
                return `Missing configuration: ${missing.join(', ')} in configuration file. Please ask the user to provide the missing configuration using the ask_for_data tool.`;
            }
            PlayHT.init({ apiKey: apiKey, userId: userId, });
            function getNonce() {
                return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            }
            async function speakSentence(sentence: any, voice: any) {
                if (!sentence) return;
                const stream = await PlayHT.stream(sentence, {
                    voiceEngine: "PlayHT2.0-turbo",
                    voiceId: voice === 'male' ? maleVoice : femaleVoice,
                });
                const chunks: any = [];
                stream.on("data", (chunk: any) => chunks.push(chunk));
                //console.log(`${sentence}`);
                return new Promise((resolve, reject) => {
                    stream.on("end", () => {
                        const buf = Buffer.concat(chunks);
                        // save the audio to a file
                        const filename = `${getNonce()}.mp3`;
                        fs.writeFileSync(filename, buf);
                        player.play(filename, function (err: any) {
                            fs.unlinkSync(filename);
                            resolve(`done`);
                        });
                    });
                })
            }
            let sentenceSplit = await api.callLLM(
                `You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. 
                **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**
                This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. 
                For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'
                When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.
                **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**`,
                [{ role: "user", content: text }],
                (e: any) => { },
                false
            );
            sentenceSplit = JSON.parse(sentenceSplit.choices[0].message.content);
            const sentences = sentenceSplit.fragments;
            // split the text into sentences
            const consumeSentence = async () => {
                return new Promise((resolve, reject) => {
                    const loop: any = async () => {
                        const sentence = sentences.shift();
                        if (!sentence) return resolve('done');
                        await speakSentence(sentence, voice);
                        return await loop();
                    };
                    return loop();
                });
            };
            await consumeSentence();
            return text;
        },
        nextState: null
    }
};



export default baseTools;