import { EventEmitter } from "eventemitter3";
import useStore from "./store";
import fs from 'fs';
import { z } from 'zod';

export class Assistant extends EventEmitter {

    tools: any;
    store: any;

    initialState: any = {
        thoughts: '',
        remainingTasks: [],
        currentTask: null,
        completedTasks: [],
        percentComplete: 0,

    };

    stateSchema = z.object({
        thoughts: z.string().optional(),
        remainingTasks: z.array(z.string()).optional(),
        currentTask: z.object({
            name: z.string(),
            workProducts: z.array(z.string()),
            lastResponse: z.string().optional(),
        }).nullable(),
        completedTasks: z.array(
            z.object({
                name: z.string(),
                workProducts: z.array(z.string()),
            })
        ).default([]),
        percentComplete: z.number().min(0).max(100).default(0),
    });

    async callTools(tools: any, state: any) {
        const results: any = [];
        for (const tool of tools) {
            if (tool.type === 'text') {
                this.emit('text', tool.text);
                results.push(tool.text);
                continue;
            }
            tool.command = tool.command || tool.name;
            tool.parameters = tool.params || tool.parameters;
            this.emit('log', `Calling tool: ${tool.command} with parameters: ${JSON.stringify(tool.parameters)}`);
            const toolResult = await this.callTool(tool.name, tool.parameters);
            this.emit('log', `Tool response: ${toolResult}`);
            results.push(toolResult);
        }
        return results;
    }

    async callTool(toolName: string, params: any) { return await this.tools[toolName].action(params, this); }

    constructor() {
        super();

        this.callTools = this.callTools.bind(this);
        this.callTool = this.callTool.bind(this);

        this.tools = {
            loadTools: {
                schema: {
                    "name": "loadTools",
                    "description": "Load tools from the tools folder.",
                    "input_schema": {
                        "type": "object",
                        "properties": {}
                    }
                },
                action: async (params: any, api: any) => {
                    try {
                        const tools = fs.readdirSync(__dirname + '/tools');
                        for (const tool of tools) {
                            const toolObj = (await import(__dirname + `/tools/${tool}`));
                            api.tools[toolObj.default.schema.name] = toolObj.default;
                        }
                        return Object.keys(api.tools);
                    } catch (error: any) {
                        return `Error loading tools: ${error.message}`;
                    }
                }
            },
            callTool: {
                schema: {
                    "name": "callTool",
                    "description": "Call a tool by name with the given parameters.",
                    "input_schema": {
                        "type": "object",
                        "properties": {
                            "tool": {
                                "type": "string"
                            },
                            "parameters": {
                                "type": "object"
                            }
                        },
                        "required": [
                            "tool",
                            "parameters"
                        ]
                    }
                },
                action: async ({ tool, parameters }: any, api: any) => {
                    return api.callTool(tool, parameters);
                }
            },
        }

        this.store = useStore;

        this.callTool('loadTools', {}).then(console.log).catch(console.error);
    }

    async callAgent(input: string, onUpdate: any) {
        const chalk: any = (await import('chalk')).default;
        const boxen: any = (await import('boxen')).default;
        this.on('text', onUpdate);
        try {
            useStore.setState({
                thoughts: '',
                completedTasks: [],
                remainingTasks: [input],
                currentTask: { name: input, workProducts: [] },
                percentComplete: 0
            });
            while (useStore.getState().remainingTasks.length > 0) {
                try {
                    const task = useStore.getState().currentTask?.name;
                    if (!task) break;
                    this.emit('text', chalk.bold.blue(`Performing task: ${task}`));
                    let response = await this.callTool('performTask', { task });
                    response = Array.isArray(response) ? response.join(' ') : response;
                    this.emit('text', chalk.green(`${boxen(JSON.stringify(response), { padding: 1 })}`));
                    useStore.getState().setCurrentTaskResponse(response);
                    useStore.getState().addWorkProductToCurrentTask(response);
                    if (useStore.getState().percentComplete === 100) {
                        if (useStore.getState().remainingTasks.length === 0) {
                            break;
                        }
                    }
                    await this.callTool('reviewWorkProducts', {});
                    const nextAction = await this.callTool('decideNextAction', {});
                    if (nextAction === 'Session completed.') { break; }
                }
                catch (error) {
                    console.error(chalk.red(error));
                }
            }
        } catch (error) {
            console.error(chalk.red(error));
        }
    }
}

import readline from 'readline';

let rl: any
const assistant = new Assistant();


async function main() {
    const chalk: any = (await import('chalk')).default;
    const { highlight } = await import('cli-highlight');
    console.log(chalk.bold.yellow('AI Assistant CLI 1.0.0'));
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
                    const lines = text.split('\n');
                    lines.forEach((line: string) => console.log(highlight(line, { ignoreIllegals: true })));
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
main().then(()=>{}).catch(console.error);
