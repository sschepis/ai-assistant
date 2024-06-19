// Description: This file contains the code for the CLI tool.
const axios = require('axios');
const fs = require('fs');
const child_process = require('child_process');
const { createStore } = require('redux');
const { composeWithDevTools } = require('redux-devtools-extension');
const { z } = require('zod');

let out = {};

const getToolsHelp = (tools) => {
    let help = '';
    for (const tool in tools) {
        if (!tools[tool].schema) continue;
        help += `**${tool}**: ${tools[tool].schema.description}\n`;
    }
    return help;
}

const toolSchema = z.object({
    name: z.string(),
    input: z.any().optional(),
});

class LogLevel {
    static INFO = 'info';
    static ERROR = 'error';
}

function reducer(state = initialState, action) {
    switch (action.type) {
        // reset to the initial state
        case 'RESET_STATE':
            return initialState;

        // set the state to a new value
        case 'SET_STATE':
            return { ...state, ...action.payload };

        // set the work products for the tasks
        case 'SET_TASK_RESPONSE':
            return {
                ...state,
                taskResponses: { 
                    ...state.taskResponses, 
                    [state.currentTask]: action.payload 
                }
            };

        // set the work products for the tasks
        case 'CLEAR_TASK_RESPONSE':
            return { ...state, taskResponses: {} };

        // set the current remaining tasks and the current task
        case 'SET_TASKS':
            return { ...state, remainingTasks: action.payload.tasks, currentTask: action.payload.tasks[0] };

        // add tasks to the remaining tasks
        case 'ADD_REMAINING_TASKS':
            return { ...state, remainingTasks: [...state.remainingTasks, ...action.payload] };

        // set the current task
        case 'SET_CURRENT_TASK':
            return { ...state, currentTask: action.payload };

        // set the current task
        case 'SET_PERCENT_COMPLETE':
            return { ...state, percent_complete: parseInt(action.payload) };

        // set a work product for a task
        case 'SET_WORK_PRODUCT':
            const { task, work_product } = action.payload;
            if (typeof task === 'string' && task.trim().length > 0) {
                return {
                    ...state,
                    workProducts: {
                        ...state.workProducts,
                        [task]: work_product
                    },
                };
            }
            return state;

        // set work products for multiple tasks
        case 'COMPLETE_TASK':
            const { completedTask } = action.payload;
            if (typeof completedTask === 'string' && completedTask.trim().length > 0) {
                const currentTaskIndex = state.remainingTasks.indexOf(completedTask);
                if (currentTaskIndex !== -1) {
                    const updatedRemainingTasks = [
                        ...state.remainingTasks.slice(0, currentTaskIndex),
                        ...state.remainingTasks.slice(currentTaskIndex + 1),
                    ];
                    const nextTask = updatedRemainingTasks.length > 0 ? updatedRemainingTasks[0] : '';
                    return {
                        ...state,
                        completedTasks: [...state.completedTasks, completedTask],
                        remainingTasks: updatedRemainingTasks,
                        currentTask: nextTask,
                    };
                }
            }
            return state;

        // set work products for multiple tasks
        case 'COMPLETE_SESSION':
            const entries = Object.entries(state.workProducts);
            const output = entries.map(([task, workProduct]) => `${task}: ${workProduct}`).join('\n');
            return {
                ...state,
                output: output,
            };

        // set work products for multiple tasks
        default:
            return state;
    }
}


// Define the initial state
const initialState = {
    subtasks: {},
    completedTasks: [],
    remainingTasks: [],
    workProducts: {},
    taskResponses: {},
    history: [],
    currentTask: '',
    output: '',
    percent_complete: 0,
    implementationNotes: '',
    notes: '',
};

const stateSchema = z.object({
    tasks: z.array(z.string()).optional(),
    remainingTasks: z.array(z.string()).optional(),
    currentTask: z.string().optional(),
    taskResponses: z.record(z.string(), z.any()).default({}),
    implementationNotes: z.string().optional(),
    workProducts: z.record(z.string(), z.any()).optional(),
    percentComplete: z.number().min(0).max(100).default(0),
    output: z.string().optional(),
});

// Create the Redux store
const store = createStore(
    reducer,
    initialState,
    composeWithDevTools()
);

const baseTools = {
    ...out,
    // bash tool to run bash commands
    "bash": {
        schema: { "name": "bash", "description": "Run a bash command", "input_schema": { "type": "object", "properties": { "command": { "type": "string" }, "args": { "type": "array" } } } },
        action: async (params, state, api) => {
            try {
                const { exec } = child_process;
                const command = params.command;
                const args = params.args || [];
                return new Promise((resolve, reject) => {
                    exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
                        if (error) {
                            api.log(`Error executing command: ${error.stack}`, 'error');
                            return resolve(`${error.stack}`);
                        }
                        if (stderr) {
                            api.log(`Error executing command: ${stderr}`, 'error');
                            return resolve(`${stderr}`);
                        }
                        if (!stdout || stdout.trim().length === 0) {
                            stdout = `Command ${command} executed successfully.`;
                        }
                        resolve(stdout);
                    });
                });
            } catch (error) {
                api.log(`Error executing command: ${error.message}`, 'error');
                throw error;
            }
        },
        nextState: null,
    },
    // cwd tool to get the current working directory
    "cwd": {
        schema: { "name": "cwd", "description": "Get the current working directory", "input_schema": { "type": "object", "properties": {} } },
        action: async (params, state, api) => {
            try {
                const result = process.cwd();
                return result;
            } catch (error) {
                api.log(`Error getting current working directory: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // set_cwd tool to set the current working directory
    "set_cwd": {
        schema: { "name": "set_cwd", "description": "Set the current working directory", "input_schema": { "type": "object", "properties": { "path": { "type": "string" } }, "required": ["path"] } },
        action: async (params, state, api) => {
            try {
                process.chdir(params.path);
                const result = process.cwd();
                return result;
            } catch (error) {
                api.log(`Error setting current working directory: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // eval tool to evaluate a JavaScript expression
    "eval": {
        schema: { "name": "eval", "description": "Evaluate a JavaScript expression", "input_schema": { "type": "object", "properties": { "expression": { "type": "string" } } } },
        action: async (params, state, api) => {
            try {
                const result = eval(params.expression);
                return result;
            } catch (error) {
                api.log(`Error evaluating JavaScript expression: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // get_env tool to get the environment variables
    "set_tasks": {
        schema: { "name": "set_tasks", "description": "Set a list of tasks to be completed. Replaces previous list and resets the current task.", "input_schema": { "type": "object", "properties": { "items": { "type": "array", "items": { "type": "string" } } } } },
        action: async ({ items }, state, api) => {
            try {
                api.store.dispatch({ type: 'SET_TASKS', tasks: items });
                const result = `Tasks set: ${items.join(', ')}`;
                return result;
            } catch (error) {
                api.log(`Error setting tasks: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // add_tasks tool to add a list of tasks to the current list of tasks
    "add_tasks": {
        schema: { "name": "add_tasks", "description": "Add a list of tasks to the current list of tasks.", "input_schema": { "type": "object", "properties": { "items": { "type": "array", "items": { "type": "string" } } } } },
        action: async ({ items }, state, api) => {
            try {
                api.store.dispatch({ type: 'ADD_TASKS', tasks: items });
                return items;
            } catch (error) {
                api.log(`Error adding tasks: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // get_env tool to get the environment variables
    "read": {
        schema: { "name": "read", "description": "Read a file or folder", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file or folder to read" } }, "required": ["path"] } },
        action: async ({ path }, state, api) => {
            try {
                const stats = await fs.promises.stat(path);
                if (stats.isDirectory()) {
                    const files = await fs.promises.readdir(path);
                    return files;
                }
                const content = await fs.promises.readFile(path, 'utf8');
                return content;
            } catch (error) {
                api.log(`Error reading file or folder: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // write tool to write a file
    "write": {
        schema: { "name": "write", "description": "Write a file", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file to write" }, "content": { "type": "string", "description": "The content to write to the file" } }, "required": ["path", "content"] } },
        action: async ({ path, content }, stat, api) => {
            try {
                await fs.promises.writeFile(path, content);
                const result = 'File written';
                return result;
            } catch (error) {
                api.log(`Error writing file: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // replace tool to replace a string in a file
    "replace": {
        schema: { "name": "replace", "description": "Replace a string in a file", "input_schema": { "type": "object", "properties": { "path": { "type": "string", "description": "The path to the file to write" }, "search": { "type": "string", "description": "The string to search for" }, "replace": { "type": "string", "description": "The string to replace the search string with" } }, "required": ["path", "search", "replace"] } },
        action: async ({ path, search, replace }, state, api) => {
            try {
                const content = await fs.promises.readFile(path, 'utf8');
                const newContent = content.replace(search, replace);
                await fs.promises.writeFile(path, newContent);
                const result = 'String replaced';
                return result;
            } catch (error) {
                api.log(`Error replacing string in file: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // get_env tool to get the environment variables
    "status_update": {
        schema: { "name": "status_update", "description": "Update the status of a task", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to update the status for" }, "status": { "type": "string", "description": "The new status of the task" } }, "required": ["task", "status"] } },
        action: async ({ task, status }, state, api) => {
            try {
                api.taskList.updateTaskStatus(task, status);
                return `Task "${task}" status updated to "${status}"`;
            } catch (error) {
                api.log(`Error updating task status: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // get_env tool to get the environment variables
    "submit_work_products": {
        schema: { "name": "submit_work_products", "description": "Submit a work product for the task. Valid types are 'file' and 'chat'", "input_schema": { "type": "object", "properties": { "content": { "type": "array", "items": { "task": "string", "name": "string", "type": "string", "data": "string" } } }, "required": ["content"] } },
        action: async ({ content }, state, api) => {
            try {
                const workProducts = {};
                content.forEach((item) => {
                    workProducts[item.task] = item.data;
                });
                api.store.dispatch({ type: 'SET_WORK_PRODUCTS', payload: workProducts });
                return 'Work products submitted successfully for tasks: ' + content.map((item) => item.task).join(', ');
            } catch (error) {
                api.log(`Error submitting work products: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // get_env tool to get the environment variables
    "get_state": {
        schema: { "name": "get_state", "description": "Get a state object by key or a list of keys", "input_schema": { "type": "object", "properties": { "keys": { "type": "array", "items": { "type": "string" } } }, "required": ["keys"] } },
        action: async ({ keys }, state, api) => {
            try {
                if (!keys) {
                    return JSON.stringify(state);
                }
                const result = {};
                keys.forEach((key) => { result[key] = state[key]; });
                return result;
            }
            catch (error) {
                api.log(`Error getting state: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    // get_env tool to get the environment variables
    "set_state": {
        schema: { "name": "set_state", "description": "Set a state object by key", "input_schema": { "type": "object", "properties": { "key": { "type": "string" }, "value": { "type": "string" } }, "required": ["key", "value"] } },
        action: async ({ key, value }, state, api) => {
            try {
                state[key] = value;
                const result = `${key}=${value}`;
                api.store.dispatch({ type: 'SET_STATE', payload: state });
                return result;
            }
            catch (error) {
                api.log(`Error setting state: ${error.message}`, 'error');
                throw error;
            }
        },
        nextState: null
    },
    // get_env tool to get the environment variables
    'decompose_task': {
        schema: { "name": "decompose_task", "description": "Decompose a task into a list of subtasks automatically added to your remaining tasks. Returns input task if it cannot be decomposed further", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" } }, "required": ["task"] } },
        action: async ({ task }, state, api) => {
            try {
                const prompt = `Decompose task "${task}" into a list of subtasks that can each be performed in one session by you or another expert. If the task cannot be decomposed further, return the input task as the only subtask. RETURN ALL RESULTS USING JSON WITH FORMAT { "tasks": string[] }. RETURN ONLY RAW JSON WITHOUT SURROUNDING CODEBLOCKS OR QUOTES.`;
                const response = await api.callLLM(prompt, prompt, api.tools, state);
                const subtasks = JSON.parse(response).tasks;
                api.store.dispatch({ type: 'ADD_REMAINING_TASKS', payload: subtasks });
                return { tasks: subtasks };
            } catch (error) {
                api.log(`Error decomposing task: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    // get_env tool to get the environment variables
    "determine_if_task_needs_tooling": {
        schema: { "name": "determine_if_task_needs_tooling", "description": "Determine if a task requires tooling to complete", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to determine if it needs tooling" } }, "required": ["task"] } },
        action: async ({ task }, state, api) => {
            try {
                const prompt = `Determine if task "${task}" requires tooling to complete. If the task requires tooling, return "yes". If the task does not require tooling, return "no". RETURN ONLY "yes" OR "no".`;
                const response = await api.callLLM(prompt, prompt, api.tools, state);
                return response.trim().toLowerCase() === 'yes';
            } catch (error) {
                api.log(`Error determining if task needs tooling: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    // get_env tool to get the environment variables
    'perform_task': {
        schema: { "name": "perform_task", "description": "Perform a task and return the generated work products, if any, as a response", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" } },  "required": ["task"]  } },
        action: async ({ task }, state, api) => {
            try {
                const stateCopy = JSON.parse(JSON.stringify(state));
                delete stateCopy.subtasks;
                delete stateCopy.workProducts;
                const prompt = `You are an expert agent operating in a VS Code extension context. Your goal is to perform the given task to the best of your abilities using a creative combination of your innate skills and your advanced and powerful tooling.\n\nTask: ${task}\n  \nCurrent project state: ${JSON.stringify(stateCopy)}\n  \nRecent history: ${JSON.stringify(api.store.getState().history)}\n  \nInstructions:\n- Analyze the task and determine if you can complete it without using any tools.\n- If you can complete the task without tools, perform the task and return the generated work product(s) in the specified JSON format.\n- If you require tools to complete the task, list the specific tools you would use and describe how you would use them to perform the task. Do not actually call the tools.\n\nThe list of available tools are: ${getToolsHelp(baseTools)}\n  \nResponse Format (without tools):\nIf completing the task without tools, return the work product(s) in the following JSON format (exclude the angled brackets):\n<{\n  "work_products": [\n    {\n      "type": "file/chat",\n      "name": <optional_name>,\n      "data": <work_product_content>\n    },\n    ...n  ]\n}>\n  \nIf tools are required, provide your response in json format as follows:\n{\n  "tools": [{\n    name: "tool_name",\n    parameters: {\n      "param1": "value1",\n      "param2": "value2",\n      ...\n    }\n  }, ...]\n}\n\nYOU MUST ONLY RETURN JSON FORMATTED DATA. DO NOT INCLUDE ANY ADDITIONAL TEXT OR CODE BLOCKS IN YOUR RESPONSE.`;
                const callResponse = async (task, response) => {
                    // Tools are required
                    const toolingPrompt = `You are an expert agent operating in a VS Code extension context. Your goal is to perform the given task to the best of your abilities using a creative combination of your innate skills and your advanced and powerful tooling.\n\nYou previously determined that you need tools to complete the following task:\n\nTask: ${task}\n\nYou mentioned the following tools:\n${response}\n\nCurrent project state: ${JSON.stringify(stateCopy)}\n\nRecent history: ${JSON.stringify(api.store.getState().history)} yeah\n\nInstructions:\n- Use the provided tools to perform the task and generate the work product(s).\n- Determine the overall percent completion of the project and update the percent complete field in the project state.`;
                    const toolingResponse = await api.callLLM(
                        'You are an expert agent operating in a VS Code extension context. Your goal is to PERFORM THE GIVEN TASK to the best of your abilities USING a CREATIVE COMBINATION of your advanced, POWERFUL TOOLING and your INNATE SKILLS. BE CREATIVE and INNOVATIVE, TRYING DIFFERENT THINGS WHEN ONE THING FAILS. The VS Code current workspace folder is: ' + process.cwd() + '. This machine is a ' + process.platform + ' machine.',
                        toolingPrompt,
                        baseTools,
                        state, 'claude-3-opus-20240229');
                    const item = toolingResponse[toolingResponse.length - 1];
                    const toolResult = item.text || item.data;
                    api.store.dispatch({ type: 'SET_TASK_RESPONSE', payload: toolResult });
                    return toolResult;
                }
                let response = await api.callLLM(
                    'You are an expert agent operating in a VS Code extension context. Your goal is to perform the given task to the best of your abilities. The current workspace folder is: ' + process.cwd() + '. This machine is a ' + process.platform + ' machine.',
                    prompt,
                    [],
                    state,
                    'claude-3-opus-20240229'
                );
                response = response[0].text.trim();
                if (response.startsWith('{')) {
                    const data = JSON.parse(response);
                    if (data.workProducts) {
                        data.workProducts.forEach((workProduct) => {
                            if (workProduct.type === 'chat') {
                                api.chatWindow.sendMessage(workProduct.data);
                            }
                            api.store.dispatch({ type: 'SET_WORK_PRODUCT', payload: { task, work_product: workProduct.data, type: workProduct.type } });
                            api.store.dispatch({ type: 'SET_TASK_RESPONSE', payload: workProduct.data });
                            api.store.dispatch({ type: 'SET_STATE', payload: { output: workProduct.data, percent_complete: 100 } });
                            api.store.dispatch({ type: 'COMPLETE_TASK', payload: { completedTask: task } });
                            api.store.dispatch({ type: 'COMPLETE_SESSION', payload: {} });
                        });
                    }
                    if(api.store.getState().percent_complete === 100) {
                        return 'Task completed';
                    }
                    if (data.tools) {
                        response = await callResponse(task, JSON.stringify(data.tools));
                        api.store.dispatch({ type: 'SET_WORK_PRODUCT', payload: { task, work_product: response } });
                    }
                    return response;
                } else {
                    response = await callResponse(task, response);
                }
            } catch (error) {
                api.log(`Error performing task: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    // get_env tool to get the environment variables
    'generate_work_product': {
        schema: { "name": "generate_work_product", "description": "Generate a work product from the given task and response", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to decompose" }, "response": { "type": "string", "description": "The response to the task" } }, "required": ["task", "response"] } },
        action: async ({ task, response }, state, api) => {
            try {
                const prompt = `You are an expert in everything currently working on a technical project. Generate a work product from the response to the given task. The task is "${task}" and the response is: "${response}"\n". RESPOND USING A JSON OBJECT WITH FORMAT { "type": "chat/file", "name" ?: string, "data": string }`
                const result = await api.callLLM(prompt, prompt, [], state);
                const workProduct = JSON.parse(result);
                api.store.dispatch({ type: 'SET_WORK_PRODUCT', payload: { task, work_product: workProduct.data } });
                return result[0].text;
            } catch (error) {
                api.log(`Error generating work product: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    // get_env tool to get the environment variables
    'get_project_completion_status': {
        schema: { "name": "get_project_completion_status", "description": "Get the project competion status. Returns the project status (in-progress, error, completed) and a percent complete estimate", "input_schema": { "type": "object", "properties": {} } },
        action: async (params, state, api) => {
            try {
                const prompt = `Given project state (and current work products): ${JSON.stringify(state)}\n\nDetermine the overall percent completion of the project. RETURN ONLY JSON-FORMATTED DATA IN THE FOLLOWING FORMAT: { "percent_complete": 0-100 } RETURN RAW JSON WITHOUT SURROUNDING CODEBLOCKS OR QUOTES.`;
                const response = await api.callLLM(prompt, prompt, baseTools, state);
                return response[0].text;
            } catch (error) {
                api.log(`Error getting project completion status: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    // get_env tool to get the environment variables
    'process_task': {
        schema: {
            "name": "process_task",
            "description": "Review a task and its generated work products to determine the best next action to perform. Execute the next action if needed, or take no action if the task is complete.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "task": { "type": "string", "description": "The task to review" },
                    "taskResponse": { "type": "string", "description": "The response to the task" },
                    "implementationNotes": { "type": "string", "description": "Any implementation notes for the task" }
                },
                "required": ["task", "taskResponse", "implementationNotes"]
            }
        },
        action: async ({ task, taskResponse, implementationNotes }, state, api) => {
            try {
                const prompt = `
Task: ${task}

Response: ${taskResponse}

Implementation Notes: ${implementationNotes}

Current Project State:
${JSON.stringify(api.store.getState())}

Instructions:
Review the task, response, implementation notes, and current project state. Determine the best next action to take in order to complete the task. This could involve:
- Calling a tool to perform a specific action
- Updating the project state with new information
- Generating additional work products or responses
- Taking no action if the task is already complete

If an action is needed, provide the specific tool to call, the input to provide, or the state updates to make. If no action is needed, output NO_ACTION_TASK_COMPLETE .

Next Action:
`;
                const response = await api.callLLM(prompt, prompt, baseTools, state);
                const responseItems = []
                let isTaskComplete = false;
                if (Array.isArray(response)) {
                    response.map((item) => {
                        api.store.dispatch({ type: 'SET_TASK_RESPONSE', payload: item.text || 'task performed.' });
                        responseItems.push(item.text);
                        if (item.text && item.text.toUpperCase().includes('NO_ACTION_TASK_COMPLETE')) {
                            isTaskComplete = true;
                        } else if (!item.text) {
                            isTaskComplete = true;
                        }
                    });
                } else {
                    api.store.dispatch({ type: 'SET_TASK_RESPONSE', payload: response.text });
                    responseItems.push(response.text);
                    if (response.text.toUpperCase().includes('NO_ACTION_TASK_COMPLETE')) {
                        isTaskComplete = true;
                    }
                }
                if (isTaskComplete) {
                    api.store.dispatch({ type: 'COMPLETE_TASK', payload: { completedTask: task } });
                }
                return responseItems;
            } catch (error) {
                api.log(`Error processing task: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    "select_next_task": {
        schema: { "name": "select_next_task", "description": "Select the next task to work on from the list of incomplete tasks.", "input_schema": { "type": "object", "properties": {} } },
        action: async ({ }, state, api) => {
            try {
                const stateCopy = JSON.parse(JSON.stringify(state));
                const incompleteTasks = state.remainingTasks;
                if (incompleteTasks.length === 0) {
                    return 'No tasks remaining';
                }
                const prompt = `Given: Project state: ${JSON.stringify(stateCopy)}\n\nDetermine the best next task to work on. If no further tasks should be performed, set the 'completed' flag in the response to true. RETURN ONLY JSON-FORMATTED DATA IN THE FOLLOWING FORMAT: { "task": "task_name", "completed": true/false } RETURN RAW JSON WITHOUT SURROUNDING CODEBLOCKS OR QUOTES.`;
                const response = await api.callLLM(prompt, prompt, baseTools, state);
                const pickedtask = JSON.parse(response);
                if (pickedtask.completed) {
                    api.store.dispatch({ type: 'SET_STATE', payload: { percent_complete: 100 } });
                    api.store.dispatch({ type: 'COMPLETE_SESSION', payload: { work_products: [] } });
                    return 'All tasks completed';
                }
                api.store.dispatch({ type: 'SET_CURRENT_TASK', payload: pickedtask.task });
                const result = `next task picked: ${pickedtask.task}`;
                return result;
            } catch (error) {
                api.log(`Error selecting next task: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    "set_current_task": {
        schema: { "name": "set_current_task", "description": "Set the current task to the specified task", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to set as the current task" } }, "required": ["task"] } },
        action: async ({ task }, state, api) => {
            try {
                api.store.dispatch({ type: 'SET_CURRENT_TASK', payload: task });
                return `current task set to: ${task}`;
            } catch (error) {
                api.log(`Error setting current task: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    'complete_task': {
        schema: { "name": "complete_task", "description": "Mark a task as complete in the task list and set the tasks work product as specified", "input_schema": { "type": "object", "properties": { "task": { "type": "string", "description": "The task to mark as complete" }, "work_products": { "type": "array", "description": "The work products for the task" } }, "required": ["task", "work_products"] } },
        action: async ({ task, work_products }, state, api) => {
            try {
                api.store.dispatch({ type: 'SET_WORK_PRODUCT', payload: { task, work_product: work_products } });
                api.store.dispatch({ type: 'COMPLETE_TASK', payload: { completedTask: task } });
                return "Work products submitted and task marked as complete";
            } catch (error) {
                api.log(`Error completing task: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    'complete_session': {
        schema: { "name": "complete_session", "description": "Mark all remaining tasks as complete and submit the final work product for the project", "input_schema": { "type": "object", "properties": { "work_products": { "type": "array", "description": "The work products for the tasks" } }, "required": ["work_products"] } },
        action: async ({ work_products }, state, api) => {
            try {
                api.store.dispatch({ type: 'COMPLETE_SESSION', payload: { work_products } });
                return "Session completed";
            } catch (error) {
                api.log(`Error completing session: ${error.message}`, 'error');
                throw error;
            }
        }
    },
    'finalize_response': {
        schema: {
            name: "finalize_response",
            description: "Finalize the response for the task",
            input_schema: { type: "object", properties: {} },
        },
        action: async ({ }, state, api) => {
            try {
                const prompt = `You are an expert in everything currently working on a technical project. You are tasked with generating a finalized response for the project. Your response should contain all the work products generated during the project, without any intermediate or irrelevant work products. Your response should be succinct and targeted. Return your response as a string, formatted using markdown.
              Current project state: ${JSON.stringify(api.store.getState())}
              `;
                const response = await api.callLLM(prompt, prompt, [], state);
                api.store.dispatch({ type: 'SET_STATE', payload: { output: response[0].text } });
                return response[0].text;
            } catch (error) {
                api.log(`Error finalizing response: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    'get_percent_complete': {
        schema: {
            name: "get_percent_complete",
            description: "Get the percent complete of the current task",
            input_schema: { type: "object", properties: {} },
        },
        action: async ({ state }, _state, api) => {
            try {
                const stateCopy = JSON.parse(JSON.stringify(state));
                delete stateCopy.subtasks;
                delete stateCopy.workProducts;
                const prompt = `You are an expert in everything currently working on a technical project. You are tasked with determining the percent complete of the overall project. Return ONLY the percent complete as a number between 0 and 100. YOU MUST NOT RETURN ANTHING ELSE.
              Current project state: ${JSON.stringify(stateCopy)}
              `;
                const response = await api.callLLM(prompt, prompt, [], state); // Assuming baseTools is not needed
                return 'Percent complete: ' + response + '%';
            } catch (error) {
                api.log(`Error getting percent complete: ${error.message}`, 'error');
                throw error;
            }
        },
    },
    'say_aloud': {
        schema: {
            name: "say_aloud",
            description: "Say the text using text-to-speech",
            input_schema: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        description: "The text to say",
                    },
                    voice: {
                        type: "string",
                        description: "The voice to use (can be 'male' or 'female'). If not specified, the default female voice will be used",
                    },
                },
                required: ["text"],
            },
        },
        action: async ({ text, voice }, state, api) => {
            try {
                const PlayHT = await import('playht');
                const player = (await import('play-sound')).default; // Assuming 'play-sound' exports a default function

                player((error) => {
                    if (error) {
                        api.log(`Error playing sound: ${error}`, 'error');
                    }
                });

                const apiKey = process.env.PLAYHT_AUTHORIZATION;
                const userId = process.env.PLAYHT_USER_ID;
                const maleVoice = process.env.PLAYHT_MALE_VOICE;
                const femaleVoice = process.env.PLAYHT_FEMALE_VOICE;

                if (!voice) voice = femaleVoice;
                if (!apiKey || !userId || !maleVoice || !femaleVoice) {
                    const missing = [];
                    if (!apiKey) missing.push('playHT.apiKey');
                    if (!userId) missing.push('playHT.userId');
                    if (!maleVoice) missing.push('playHT.maleVoice');
                    if (!femaleVoice) missing.push('playHT.femaleVoice');
                    return `Missing configuration: ${missing.join(', ')} in configuration file. Please ask the user to provide the missing configuration using the ask_for_data tool.`;
                }

                PlayHT.init({ apiKey, userId });

                function getNonce() {
                    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                }

                async function speakSentence(sentence, voice) {
                    if (!sentence) return;
                    const stream = await PlayHT.stream(sentence, {
                        voiceEngine: "PlayHT2.0-turbo",
                        voiceId: voice === 'male' ? maleVoice : femaleVoice,
                    });
                    const chunks = [];
                    stream.on("data", (chunk) => chunks.push(chunk));
                    return new Promise((resolve) => {
                        stream.on("end", () => {
                            const buf = Buffer.concat(chunks);
                            const filename = `${getNonce()}.mp3`;
                            fs.writeFileSync(filename, buf);
                            player.play(filename, (err) => {
                                fs.unlinkSync(filename);
                                resolve('done');
                            });
                        });
                    });
                }

                let sentenceSplit = await api.callLLM(
                    `You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. 
        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**
        This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. 
        For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'
        When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.
        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**`,
                    [{ role: "user", content: text }],
                    () => { },
                    false
                );
                sentenceSplit = JSON.parse(sentenceSplit.choices[0].message.content);
                const sentences = sentenceSplit.fragments;
                const consumeSentence = async () => {
                    return new Promise(async (resolve) => {
                        for (const sentence of sentences) {
                            await speakSentence(sentence, voice);
                        }
                        resolve('done');
                    });
                };
                await consumeSentence();
                return text;
            } catch (error) {
                api.log(`Error saying text aloud: ${error.message}`, 'error');
                throw error;
            }
        },
        nextState: null,
    },
    'select': {
        schema: {
            name: "select",
            description: "Performs the selector operation on the HTML page at the given path. The operation can be get, append, prepend, replace, remove, get_attributes, or set_attributes, or summarize. IF running in the browser, the path is ignored and the current page is used.",
            input_schema: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "The file path to the HTML file.",
                    },
                    operation: {
                        type: "string",
                        description: "The operation to perform on the selector. Can be get, append, prepend, replace, remove, get_attributes, set_attributes, or summarize",
                    },
                    selector: {
                        type: "string",
                        description: "The CSS selector to match elements.",
                    },
                    value: {
                        type: "string",
                        description: "The HTML content to append.",
                    },
                    n: {
                        type: "string",
                        description: "For summarize, specifies the depth of child elements to summarize. 0 for detailed information.",
                    },
                },
                required: ["selector", "operation"],
            },
        },
        action: async function ({ path, operation, selector, value, n }) {
            const { JSDOM } = await import('jsdom');
            let dom;
            try {
                const html = fs.readFileSync(path, 'utf8');
                dom = new JSDOM(html).window.document;
            } catch (e) {
                // Handle the error, maybe by providing a default DOM or logging the error
                console.error("Error loading HTML:", e);
                return "Error loading HTML"; // Or handle it differently
            }

            function getDOMNode(path, selector, isBrowser) {
                // This function seems redundant in this context, as it always reads from a file
                // You might want to adjust its logic based on the intended behavior
                let dom;
                const html = fs.readFileSync(path, 'utf8');
                dom = new JSDOM(html).window.document;
                return dom.querySelectorAll(selector);
            }

            const elements = getDOMNode(path, selector, true);
            let result = '';

            switch (operation) {
                case 'get':
                    result = Array.from(elements).map((ele) => ele.innerHTML).join('\n');
                    break;
                case 'append':
                    elements.forEach((ele) => (ele.innerHTML += value));
                    result = 'Content appended successfully.';
                    break;
                case 'prepend':
                    elements.forEach((ele) => (ele.innerHTML = value + ele.innerHTML));
                    result = 'Content prepended successfully.';
                    break;
                case 'replace':
                    elements.forEach((ele) => (ele.innerHTML = value));
                    result = 'Content replaced successfully.';
                    break;
                case 'remove':
                    elements.forEach((ele) => (ele.innerHTML = ele.innerHTML.replace(value, '')));
                    result = 'Content removed successfully.';
                    break;
                case 'get_attributes':
                    result = Array.from(elements).map((ele) => ele.getAttribute(value));
                    break;
                case 'set_attributes':
                    elements.forEach((ele) => ele.setAttribute(value, n));
                    result = 'Attribute set successfully.';
                    break;
                case 'summarize':
                    const summarizeHTMLElement = (element, level = 0) => {
                        let summary = { textSummary: '', imageCount: 0, linkCount: 0, interactiveCount: 0, divCount: 0 };

                        if (level === 0) {
                            summary.textSummary = element.textContent.slice(0, 100) + '...';
                            summary.imageCount += element.querySelectorAll('img').length;
                            summary.linkCount += element.querySelectorAll('a').length;
                            summary.divCount += element.querySelectorAll('div').length;
                            summary.interactiveCount += element.querySelectorAll('input, button, select, textarea, video, audio, iframe').length;
                        } else {
                            const children = element.children;
                            for (let i = 0; i < children.length; i++) {
                                let childSummary = summarizeHTMLElement(children[i], level - 1);
                                summary.textSummary += ' ' + parseInt(childSummary.textSummary);
                                summary.imageCount += childSummary.imageCount;
                                summary.linkCount += childSummary.linkCount;
                                summary.interactiveCount += childSummary.interactiveCount;
                            }
                            summary.textSummary = `${summary.textSummary.substring(0, 50)}... (${children.length} elements)`;
                        }
                        return summary;
                    }

                    const summary = { textSummary: '', imageCount: 0, linkCount: 0, interactiveCount: 0 };
                    elements.forEach((element) => {
                        if (n === 0) {
                            summary.textSummary = element.textContent.slice(0, 100) + '...';
                            summary.imageCount += element.querySelectorAll('img').length;
                            summary.linkCount += element.querySelectorAll('a').length;
                            summary.interactiveCount += element.querySelectorAll('input, button, select, textarea').length;
                        } else {
                            const children = element.children;
                            for (let i = 0; i < children.length; i++) {
                                let childSummary = summarizeHTMLElement(children[i], n - 1);
                                summary.textSummary += childSummary.textSummary;
                                summary.imageCount += childSummary.imageCount;
                                summary.linkCount += childSummary.linkCount;
                                summary.interactiveCount += childSummary.interactiveCount;
                            }
                            summary.textSummary += `${summary.textSummary.substring(0, 50)}... (${children.length} elements)\n`;
                        }
                    });
                    result = summary;
                    break;
                default:
                    result = 'Invalid operation.';
            }

            fs.writeFileSync(path, dom.serialize());
            return dom.serialize();
        },
    },
    'sed_string': {
        schema: {
            name: "sed_string",
            description: "Perform sed operations on a given string",
            input_schema: {
                type: "object",
                properties: {
                    inputString: {
                        type: "string",
                        description: "The input string to be transformed",
                    },
                    pattern: {
                        type: "string",
                        description: "The sed pattern to apply",
                    },
                },
                required: ["inputString", "pattern"],
            },
        },
        action: async ({ inputString, pattern }) => {
            try {
                const sed = await import('sed-lite');
                return sed(inputString, pattern);
            } catch (err) {
                return JSON.stringify(err.message);
            }
        },
    },
    'sed_file': {
        schema: {
            name: "sed_file",
            description: "Perform sed operations on the contents of a file",
            input_schema: {
                type: "object",
                properties: {
                    filePath: {
                        type: "string",
                        description: "The path of the file to be transformed",
                    },
                    pattern: {
                        type: "string",
                        description: "The sed pattern to apply",
                    },
                },
                required: ["filePath", "pattern"],
            },
        },
        action: async ({ filePath, pattern }) => {
            try {
                if (!fs.existsSync(filePath)) {
                    return `File not found: ${filePath}`;
                }
                const sed = await import('sed-lite');
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const transformedContent = sed(fileContent, pattern);
                fs.writeFileSync(filePath, transformedContent);
                return `File transformed successfully.`;
            } catch (err) {
                return JSON.stringify(err.message);
            }
        },
    },
}

class Assistant {
    store = store;
    constructor() {
    }

    log(message, level = 'INFO') {
        const formattedMessage = `[${new Date().toLocaleTimeString()}] [${level.toUpperCase()}] ${message}`;
        if (level === 'ERROR') {
            console.error(formattedMessage);
        }
    }

    async callTool(tool, state) {
        try {
            const result = [];
            const input = tool.input;
            const toolCall = baseTools[tool.name];
            if (toolCall) {
                const action = toolCall.action;
                try {
                    const ret = await action(input, state, this);
                    result.push({
                        text: `${tool.name} result: ${ret}`,
                        type: 'tool_use',
                    });
                } catch (e) {
                    result.push({ error: e.message });
                }
            }
            return result;
        } catch (error) {
            this.log(`Error calling tool: ${error.message}`, 'error');
            throw error;
        }
    }

    async callLLM(persona, prompt, tools = {}, state = {}, model = 'claude-3-opus-20240229') {
        try {
            // Validate the state against the schema
            stateSchema.parse(state);

            const schemas = Object.values(tools).map((tool) => tool.schema);
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: model,
                max_tokens: 4000,
                system: persona,
                tools: schemas,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'anthropic-beta': 'tools-2024-04-04',
                },
            });
            const data = response.data;

            const result = [];
            if (Array.isArray(data.content)) {
                for (const tool of data.content) {
                    if (tool.type === 'text') {
                        result.push({
                            text: tool.text,
                            type: 'text',
                        });
                    } else if (tool.type === 'tool_use') {
                        const toolResult = await this.callTool(tool, state);
                        result.push(...toolResult);
                    }
                }
            }
            return result;
        } catch (error) {
            this.log(`Error calling LLM: ${error.message}`, 'error');
            throw error;
        }
    }

    async callTool(tool, state) {
        try {
            const result = [];
            const input = tool.input;
            const toolCall = baseTools[tool.name];
            if (toolCall) {
                const action = toolCall.action;
                try {
                    const ret = await action(input, state, this);
                    result.push({
                        text: `${tool.name} result: ${ret}`,
                        type: 'tool_use',
                    });
                } catch (e) {
                    result.push({ error: e.message });
                }
            }
            return result;
        } catch (error) {
            this.log(`Error calling tool: ${error.message}`, 'error');
            throw error;
        }
    }

    async processLLMResponse(content, state) {
        const result = [];
        for (const item of content) {
            if (item.type === 'text') {
                result.push({ type: 'chat', data: item.text });
            } else if (item.type === 'tool_use') {
                toolSchema.parse(item);
                try {
                    const toolResults = await this.callTool(item, state);
                    result.push(...toolResults);
                } catch (error) {
                    this.log(`Error executing tool '${item.name}': ${error.message}`, 'ERROR');
                    result.push({ type: 'error', data: `Tool execution error: ${error.message}` });
                }
            }
        }
        return result;
    }

    async callTool(tool, state) {
        const selectedTool = baseTools[tool.name];
        if (!selectedTool) {
            throw new Error(`Tool not found: ${tool.name}`);
        }
        this.log(`Calling tool '${tool.name}' with input: ${JSON.stringify(tool.input)}`, 'DEBUG');
        const result = await selectedTool.action(tool.input, state, this);
        this.log(`Tool '${tool.name}' returned: ${JSON.stringify(result)}`, 'DEBUG');
        return [{ type: 'tool_use', data: result }];
    }

    async performTask(state) {
        const task = state.currentTask;
        if (!task) {
            throw new Error('Cannot perform task: No task selected.');
        }
        try {
            this.log(`Performing task: ${task}`);

            let response = await baseTools['perform_task'].action({ task }, state, this);
            if(response) {
                if(response.data || response.text) {
                    response = response.data || response.text;
                }
                const updatedTaskResponses = {
                    ...state.taskResponses,
                    [task]: response,
                };
                store.dispatch({ type: 'SET_STATE', payload: { taskResponses: updatedTaskResponses } });
            }

            const workProducts = (Array.isArray(response) ? response : [response])
                .flatMap((item) => {
                    try {
                        return (typeof item === 'string' ? JSON.parse(item) : item)
                    } catch (error) {
                        return item;
                    }
                });
            workProducts.forEach((workProduct) => {
                if (workProduct.type === 'chat') {
                    this.log(workProduct.data);
                }
                store.dispatch({ type: 'SET_WORK_PRODUCT', payload: { task, work_product: workProduct } });
            });
            this.log(`Task "${task}" performed successfully.`);
        } catch (error) {
            this.log(`Error performing task: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async send(input) {
        try {
            this.log(`User input: ${input}`);
            store.dispatch({ type: 'RESET_STATE' });
            store.dispatch({ type: 'SET_TASKS', payload: { tasks: [input] } });
            while (store.getState().remainingTasks.length > 0) {
                let state = store.getState();
                if (!state.currentTask) {
                    this.log('Selecting next task...');
                    await baseTools['select_next_task'].action({}, state, this);
                    state = store.getState();
                    this.log(`Next task selected: ${state.currentTask}`);
                }
                await this.performTask(state);
                state = store.getState();
                this.log(`Task response: ${JSON.stringify(state.taskResponses[state.currentTask])}`);
                this.log('Processing task...');
                const result = await baseTools['process_task'].action({
                    task: state.currentTask,
                    taskResponse: state.taskResponses[state.currentTask],
                    implementationNotes: state.implementationNotes,
                }, state, this);
                this.log(`Task processed: ${result}`);
                // Update task response for the current task
                const updatedTaskResponses = {
                    ...state.taskResponses,
                    [state.currentTask]: {...(state.taskResponses[state.currentTask] || []), result},
                };
                const payload = {
                    taskResponses: updatedTaskResponses,
                    implementationNotes: (state.implementationNotes ? state.implementationNotes + '\n' : '') + result.join('\n'),
                };
                store.dispatch({ type: 'SET_STATE', payload });
                this.log(`Task response updated: ${result}`);
                // Check for completion after processing
                if (store.getState().remainingTasks.length === 0 || store.getState().percentComplete === 100) {
                    this.log(`All tasks completed.`);
                    store.dispatch({ type: 'COMPLETE_WORK_SESSION' });
                    await baseTools['finalize_response'].action({}, store.getState(), this);
                    const finalOutput = store.getState().output;
                    this.log(`Final response: ${finalOutput}`);
                    return finalOutput || "";
                }
            }
            return store.getState().output || "";
        } catch (error) {
            this.log(`Error sending input: ${error.message}`, LogLevel.ERROR); // Assuming LogLevel is defined elsewhere
            throw error;
        }
    }
}

const assistant = new Assistant();
const readline = require('readline');
let rl

console.log('ai assistant cli 1.0.0');
setTimeout(() => {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    })
    .on('close', () => {
        process.exit(0);
    })
    rl.on('line', async (input) => {
        try {
            const response = await assistant.send(input);
            console.log(response);
        } catch (error) {
            console.error(error);
        } finally {
            rl.prompt();
        }
    });
    rl.prompt();
} , 100);