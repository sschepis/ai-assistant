import "dotenv/config";
import { EventEmitter } from "eventemitter3";
import axios from 'axios';
import shell from 'shelljs';
import fs from 'fs';

// extract json from a string. these might be text around the json so this function applies a regex to extract the json, which cuould either be a single json object or an array of json objects
function extractJson(content: string) {
    const jsonObjects = [];
    let currentObject = '';
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '{' && !inString) {
            openBraces++;
            if (openBraces === 1) {
                currentObject = '{';
            } else {
                currentObject += char;
            }
        } else if (char === '}' && !inString) {
            openBraces--;
            currentObject += char;
            if (openBraces === 0) {
                try {
                    const parsedObject = JSON.parse(currentObject);
                    jsonObjects.push(parsedObject);
                    currentObject = '';
                } catch (error) {
                    // Invalid JSON, ignore and continue
                    currentObject = '';
                }
            }
        } else if (char === '[' && !inString) {
            openBrackets++;
            currentObject += char;
        } else if (char === ']' && !inString) {
            openBrackets--;
            currentObject += char;
        } else if (char === '"' && !escapeNext) {
            inString = !inString;
            currentObject += char;
        } else if (char === '\\' && !escapeNext) {
            escapeNext = true;
            currentObject += char;
        } else {
            escapeNext = false;
            currentObject += char;
        }
    }

    return jsonObjects;
}

export default class Assistant extends EventEmitter {

    public chatWindow: any;
    public apiKey: string = process.env.ANTHROPIC_API_KEY || '';

    tools: any;
    store: any;

    async callTool(toolName: string, params: any) { return await this.tools[toolName].action(params, this); }

    constructor() {
        super();

        this.callTool = this.callTool.bind(this);

        this.store = {};

        function getNonce() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }

        this.tools = {
            echo: {
                schema: {
                    "name": "echo",
                    "description": "Print the given text to the console",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "The text to print"
                            }
                        },
                        "required": ["text"]
                    }
                },
                action: async ({ text }: any, api: any) => {
                    api.emit('text', text);
                    return text;
                }
            },
            ask: {
                schema: {
                    "name": "ask",
                    "description": "Ask the user a question and return their response",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string",
                                "description": "The question to ask the user"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": ["prompt"]
                    }
                },
                action: async ({ prompt, resultVar }: any, api: any) => {
                    return new Promise((resolve, reject) => {
                        api.emit('text', prompt);
                        api.chatWindow = (response: any) => {
                            if(resultVar) {
                                api.store[resultVar] = response;
                            }
                            resolve(response);
                        };
                    });
                }
            },
            busybox: {
                schema: {
                    "name": "busybox",
                    "description": "A versatile function that provides a lot of functionality. Commands include 'ls', 'cat', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'find', 'chmod', 'chown', 'stat', 'node', 'python', 'jq', 'date', 'hostname', 'whoami', 'uptime', 'ping', 'curl', 'wget', 'echo', 'grep', 'sed', 'awk', 'git', 'ps', 'kill', 'help'.",
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
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable name to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        }
                    },
                    "output_schema": {
                        "type": "string",
                        "description": "The output of the command, either as a string or Buffer."
                    }
                },
                action: async (params_array: any, api: any) => {
                    for (const params in params_array) {
                        const { command, args = [], options = {}, resultVar } = params_array[params];

                        const supportedCommands: any = {
                            // File system
                            'ls': (args: string[]) => {
                                if (!Array.isArray(args)) {
                                    args = [args]
                                }
                                if (args.length === 0) {
                                    args = ['.']; // Default to current directory
                                }
                                return shell.ls(...args).toString()
                            },
                            'cat': (args: string[]) => {
                                if (!Array.isArray(args)) {
                                    args = [args]
                                }
                                if (args.length === 0) {
                                    throw new Error('cat: missing file');
                                }
                                return shell.cat(...args).toString();
                            },
                            'pwd': () => shell.pwd().toString(),
                            'mkdir': (args: string[]) => {
                                if (!Array.isArray(args)) {
                                    args = [args]
                                }
                                if (args.length === 0) {
                                    throw new Error('mkdir: missing directory');
                                }
                                return shell.mkdir(...args);
                            },
                            'touch': (args: string[]) => {
                                if (!Array.isArray(args)) {
                                    args = [args]
                                }
                                if (args.length === 0) {
                                    throw new Error('touch: missing file');
                                }
                                return shell.touch(...args);
                            },
                            'rm': (args: string[]) => {
                                if (!Array.isArray(args)) {
                                    args = [args]
                                }
                                if (args.length === 0) {
                                    throw new Error('rm: missing file');
                                }
                                return shell.rm(...args);
                            },
                            'cp': (args: string[]) => (shell.cp as any)(...args),
                            'mv': (args: string[]) => (shell.mv as any)(...args),
                            'find': (args: string[]) => shell.exec(`find ${args.join(' ')}`, options).toString(), // Use args here
                            'chmod': (args: string[]) => shell.exec(`chmod ${args.join(' ')}`, options).toString(), // Use args here
                            'chown': (args: string[]) => shell.exec(`chown ${args.join(' ')}`, options).toString(), // Use args here
                            'stat': (args: string[]) => shell.exec(`stat ${args.join(' ')}`, options).toString(), // Use args here

                            // code execution
                            'node': (args: string[]) => shell.exec(`node ${args.join(' ')}`, options).toString(), // Use args here
                            'python': (args: string[]) => shell.exec(`python ${args.join(' ')}`, options).toString(), // Use args here

                            'jq': (args: string[]) => shell.exec(`jq ${args.join(' ')}`, options).toString(), // Use args here

                            // System info
                            'date': () => shell.exec('date', options).toString(),
                            'hostname': () => (shell as any).hostname().toString(),
                            'whoami': () => shell.exec('whoami', options).toString(),
                            'uptime': () => shell.exec('uptime', options).toString(),

                            // Network
                            'ping': (args: string[]) => shell.exec(`ping ${args.join(' ')} -c 4`, options).toString(), // Use args here
                            'curl': (args: string[]) => shell.exec(`curl ${args.join(' ')}`, options).toString(), // Use args here
                            'wget': (args: string[]) => shell.exec(`wget ${args.join(' ')}`, options).toString(), // Use args here

                            // String manipulation
                            'echo': (args: string[]) => shell.echo(...args).toString(),
                            'grep': (args: string[]) => (shell.grep as any)(...args).toString(),
                            'sed': (args: string[]) => (shell.sed as any)(...args).toString(),
                            'awk': (args: string[]) => shell.exec(`awk ${args.join(' ')}`, options).toString(), // awk is more complex, use exec

                            // Process management (simple examples)
                            'git': (args: string[]) => shell.exec(`git ${args.join(' ')}`, options).toString(), // Use args here
                            'ps': () => shell.exec('ps', options).toString(),
                            'kill': (args: string[]) => {
                                if (args.length === 0) {
                                    throw new Error('kill: missing process id');
                                }
                                return shell.exec(`kill ${args.join(' ')}`, options);
                            },

                            // Help
                            'help': () => `Available commands:\n${Object.keys(supportedCommands).join('\n')}`
                        };

                        const cmdFunction = supportedCommands[command];
                        if (cmdFunction) {
                            try {
                                let result = await cmdFunction(...args); // Pass 'args' to cmdFunction
                                // ShellJS often returns objects with stdout/stderr, so normalize to string
                                result = result.toString ? result.toString() : result;
                                if(resultVar) {
                                    api.store[resultVar] = result;
                                }
                                return result;
                            } catch (error: any) {
                                throw new Error(`Error executing '${command}': ${error.message}`);
                            }
                        } else {
                            throw new Error(`Invalid command: '${command}'`);
                        }
                    }
                },
            },
            callLLM: {
                schema: {
                    "name": "callLLM",
                    "description": "Call the LLM with the given system prompt and prompt. Can generate documentation, code, or other text. Parses JSON results into a JavaScript object.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string"
                            },
                            "system_prompt": {
                                "type": "string"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompt",
                            "instructions"
                        ]
                    }
                },
                action: async ({ prompt, system_prompt, resultVar }: any, api: any) => {
                    try {
                        const model = 'claude-3-opus-20240229';
                        const response = await axios.post('https://api.anthropic.com/v1/messages', {
                            model: model, max_tokens: 4000,
                            system: system_prompt, tools: [],
                            messages: [{ role: 'user', content: prompt, },],
                        }, {
                            headers: {
                                'Content-Type': 'application/json', 'x-api-key': api.apiKey,
                                'anthropic-version': '2023-06-01', 'anthropic-beta': 'tools-2024-04-04',
                            },
                        });
                        const data = response.data.content[0].text.trim();
                        try {
                            const rr = JSON.parse(data);
                            if(resultVar) {
                                api.store[resultVar] = rr;
                            }
                            return rr;
                        }
                        catch (error: any) {
                            if(resultVar) {
                                api.store[resultVar] = data;
                            }
                            return data;
                        }
                    } catch (error: any) {
                        throw error;
                    }
                }
            },
            call_agent: {
                schema: {
                    "name": "call_agent",
                    "description": "Call the agent with the given task to perform. Be descriptive and specific, giving the agent all the information it needs to perform its work.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompt": {
                                "type": "string"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompt"
                        ]
                    }
                },
                action: async ({ prompt, model = 'claude-3-opus-20240229', resultVar }: any, api: any) => {
                    try {
                        const response = await axios.post('https://api.anthropic.com/v1/messages', {
                            model: model, max_tokens: 4000,
                            system: `YOU ARE A COMMAND-EXECUTION AGENT that translates a task to perform, and functions to use to accomplish those tasks, into one or more scripts that use the provided functions to perform the work.
YOU TRANSFORM a task into a sequence of subtasks with associated scripts that use the provided functions to perform the work.
CONSIDER how you might assemble the provided functions into one or more scripts chaperoned by you to perform the given task.
THINK ABOUT the optimal sequence of tool calls you need to make to get the task done
DESIGN one or more javascript scripts that use the provided tools to perform the work.
Use scripts to sequence function calls to perform the work. use subtasks to sequence scripts, allowing you to build up complex functionality from simpler parts.
DECOMPOSE the given task into subtasks with scripts that use the provided tools.
THEN (return a JSON array of the subtasks, each with a JavaScript script that uses the provided tools to perform the work and *returns* a JSON result (for example \`... return tools.bash({"command":"ls","args":["-al","./"]})\` ). Each subtask must generate a clear deliverable and THE DELIVERABLE MUST BE MATERIALLY USEFUL TO SUBSEQUENT TASKS (be referred to by a subsequent task)! The results of priaor tasks are available in the \`taskResults\` object, indexed by the task name_results (for example, \`taskResults.myTask_results\`).
FORMAT ALL OUTPUT USING JSON [{ "task": "<taskvar>:<task>", "script": "<JavaScript script - use \`taskResults.<taskvar>_results\` to get or modify task results from earlier tasks>", "chat": "<reasoning and explanation for task>" }, ...] DO NOT PROVIDE ANY COMMENTARY BELOW OR AFTER YOUR OUTPUT. *** OUTPUT ONLY RAW, VALID JSON!! ***`, tools: [],
                            messages: [{
                                role: 'user', content: JSON.stringify({
                                    tools: Object.keys(api.tools).map((tool) => api.tools[tool].schema),
                                    task: prompt,
                                })
                            }],
                        }, {
                            headers: {
                                'Content-Type': 'application/json', 'x-api-key': api.apiKey,
                                'anthropic-version': '2023-06-01', 'anthropic-beta': 'tools-2024-04-04',
                            },
                        });
                        let ret = response.data.content[0].text;
                        const tasks = extractJson(ret)
                        const results = [];

                        api.store[prompt] = tasks;

                        if(resultVar) {
                            api.store[resultVar] = [];
                        }

                        // Process each subtask
                        for (const task of tasks) {
                            // Extract task details
                            let { task: taskName, script, chat } = task;
                            const splitTask = taskName.split(':');
                            let taskId = taskName;
                            if (splitTask.length > 1) {
                                taskId = splitTask[0];
                                taskName = splitTask[1];
                            }
                            api.store['currentTaskId'] = taskId;
                            this.emit('taskId', taskId);

                            api.store[`${taskId}_task`] = task;
                            this.emit(`${taskId}_task`, task);

                            api.store[`${taskId}_chat`] = chat;
                            this.emit(`${taskId}_chat`, chat);

                            api.store[`${taskId}_script`] = script;
                            this.emit(`${taskId}_script`, script);

                            // Execute the task script
                            const sr = await this.callScript(script);
                            task.scriptResult = sr;
                            
                            this.store[`${taskId}_results`] = sr;
                            const rout = { id: taskId, task: taskName, script, result: sr };
                            this.emit(`${taskId}_results`, rout);
                            
                            results.push(rout);

                        }

                        if(resultVar) {
                            api.store[resultVar] = results;
                        }

                        return results;
                    } catch (error: any) {
                        throw error;
                    }
                }
            },
            // uses Promise.all to run multiple agent processes in parallel. calls the call_agent tool for each agent process
            call_agents: {
                schema: {
                    "name": "call_agents",
                    "description": "Call multiple agents with the given tasks to perform. Be descriptive and specific, giving the agents all the information they need to perform their work.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompts": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompts"
                        ]
                    }
                },
                action: async ({ prompts, resultVar }: any, api: any) => {
                    try {
                        const results = await Promise.all(prompts.map(async (prompt: string) => {
                            return await api.callTool('call_agent', { prompt, model: 'claude-3-opus-20240229' });
                        }));
                        if(resultVar) {
                            api.store[resultVar] = results;
                        }
                        return results;
                    } catch (error: any) {
                        throw error;
                    }
                }
            },
            callLLMs: {
                schema: {
                    "name": "callLLMs",
                    "description": "Call the LLM with the given system prompt and prompts. Can generate documentation, code, and other text concurrently. Parses JSON results into a JavaScript object.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "prompts": {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                            },
                            "system_prompt": {
                                "type": "string"
                            },
                            "resultVar": {
                                "type": "string",
                                "description": "Optional. The variable to store the result in. Sets the taskResults.<resultVar> variable in the script context with the result of the agent call. For example, if resultVar is 'foo' then taskResults.foo will be set."
                            }
                        },
                        "required": [
                            "prompts",
                            "system_prompt"
                        ]
                    }
                },
                action: async ({ prompts, system_prompt, resultVar }: any, api: any) => {
                    try {
                        const results = await Promise.all(prompts.map(async (prompt: string) => {
                            return await api.callTool('callLLM', { prompt, system_prompt });
                        }));
                        if(resultVar) {
                            api.store[resultVar] = results;
                        }
                        return results;
                    } catch (error: any) {
                        throw error;
                    }
                }
            },
        }
    }

    async callAgent(input: string, onUpdate: any) {
        this.on('taskId', (task: any) => {
            this.on(`${task}_chat`, (chat: any) => {
                onUpdate(chat);
            });
            this.on(`${task}_results`, (result: any) => {
                onUpdate(result);
            });
        });
        try {
            const response = await this.callTool('call_agent', { prompt: input, resultVar: 'result' });
            return response[0];

        } catch (error: any) {
            onUpdate(`Error calling agent: ${error.message}`);
        }
    }

    async callScript(script: string) {
        // Create a context object with the tool functions
        const context: any = {
            tools: {},
            taskResults: {}
        };
        for (const toolName in this.tools) {
            context.tools[toolName] = async (...args: any[]) => {
                return await this.callTool(toolName, args);
            };
        }
        for (const task in this.store) {
            context.taskResults[task] = this.store[task];
            context[task] = this.store[task];
        }
        
        try {
            // Create a new function with the script code
            const scriptFunction = new Function('context', `
                    with (context) {
                        return (async function() {
                            ${script}
                        })();
                    }
                `);

            // Return the script result
            return await scriptFunction(context);
        } catch (error: any) {
            return await this.handleScriptError(error, script, context);
        }
    }

    async handleScriptError(error: Error, script: string, context: any): Promise<any> {
        // Extract error details
        const errorMessage = error.message;
        const stackTrace: any = error.stack;
        const errorLine = this.extractErrorLine(stackTrace);
    
        // Call the callLLM tool with error details and script
        const llmResponse = await this.callTool('callLLM', {
            system_prompt: 'Analyze the provided script, script error, and context, generate a fixed version of the script, and output it and an explanation of your work *in a JSON object*. Output the modified script and explanation *in JSON format* { modifiedScript, explanation }. ***OUTPUT RAW JSON ONLY***.',
            prompt: JSON.stringify({
                error: errorMessage,
                stackTrace: stackTrace,
                script: script,
                errorLine: errorLine,
                context: context
            })
        });
        const { modifiedScript, explanation } = llmResponse;
    
        this.emit('text', explanation);
    
        // Update the script and re-execute it
        return await this.callScript(modifiedScript);
    }

    extractErrorLine(stackTrace: string) {
        const lineRegex = /at .*? \(.*?:(\d+):\d+\)/;
        const match = stackTrace.match(lineRegex);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        return null;
    }

    async promptUser() {
        return new Promise((resolve) => {
            
        });
    }
}

import readline from 'readline';
import chalk from "chalk";

let rl: any
const assistant = new Assistant();
assistant.on('taskId', (taskid: any) => {
    assistant.on(`${taskid}_task`, (chat: any) => {
        console.log(chalk.bold.yellow('Task: ' + chat));
    });
    assistant.on(`${taskid}_chat`, (chat: any) => {
        console.log(chalk.bold.green(chat));
    });
    assistant.on(`${taskid}_script`, (script: any) => {
        console.log(chalk.bold.blue('Script: ' + script));
    });
    assistant.on(`${taskid}_result`, (result: any) => {
        console.log(chalk.bold.magenta(JSON.stringify(result)))
    });
});

async function main() {
    const chalk: any = (await import('chalk')).default;
    const { highlight } = await import('cli-highlight');
    console.log(chalk.bold.yellow('AI Assistant CLI 1.0.5'));
    setTimeout(() => {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.bold.green('> ')
        })
        .on('close', () => {
            process.exit(0);
        });
        rl.on('line', async (input: any) => {
            try {
                await assistant.callAgent(input, (text: any) => {
                    console.log(chalk.bold.gray(JSON.stringify(text)));
                });
                const res = assistant.store['result']
                res.forEach((r: any) => {
                    const { task, script, result } = r;
                    console.log(chalk.bold.yellow('Task: ' + task));
                    console.log(chalk.bold.blue('Script: ' + script));
                    console.log(chalk.bold.magenta(JSON.stringify(result)));
                });
            } catch (error) {
                console.error(chalk.red(error));
            } finally {
                rl.prompt();
            }
        });
        rl.prompt();
    }, 100);
}
main().then(() => { }).catch(console.error);
