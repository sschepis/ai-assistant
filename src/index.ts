import tools from './tools';

class Assistant {

    state: any = [];
    history: any = [];
    tools: any = tools;

    async callLLM(persona, prompt, tools = {}, state = {}) {
        return new Promise(async (resolve, reject) => {
            const schemas = Object.values(tools).map((tool: any) => tool.schema);
            const response = await require('node-fetch')('https://api.anthropic.com/v1/messages', {
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
            const data = await response.json();
            state[prompt] = data.content;
            
            const result = [];
            if(Array.isArray(data.content)) {
                await data.content.forEach(async (tool: any, i: number) => {
                    if(tool.type === 'text') {
                        result.push({
                            text: tool.text,
                            type: 'text'
                        });
                        return;
                    } else if(tool.type === 'tool_use') {
                        const input = tool.input;
                        const toolCall =  tools[tool.name];
                        if (toolCall) {
                            const action = toolCall.action;
                            try {
                                const ret = await action(input, state, this);
                                result.push({
                                    text: ret,
                                    type: 'tool_use'
                                });
                            } catch (e) {
                                result.push(JSON.stringify({ error: e.message }));
                            }
                        }
                    }
                });
            }
            console.log(result, null, 4);
            resolve(result);
        });
    }

    async perform_task(state) {
        const stateCopy = JSON.parse(JSON.stringify(state));
        delete stateCopy.subtasks;
        delete stateCopy.workProducts;
        const prompt = `You are a expert in everything currently working on a technical project. You are tasked with getting the project to completion. Use your expertise and the provided tools to complete the project. USE THE notes FIELD IN THE STATE TO RECORD ANY IMPORTANT INFORMATION.

Current project state: ${JSON.stringify(stateCopy)}
Recent history: ${JSON.stringify(this.history)}
`;
        const response = await this.callLLM(prompt, prompt, tools, state);
        return {
            work_products: response
        };
    }

    async review_task(state) {
        const stateCopy = JSON.parse(JSON.stringify(state));

        const prompt = `You are a expert in everything currently working on a technical project. You are tasked with getting the project to completion. Review the taskResponse and notes fields in the state for the latest work, generate a work product that represents the state of the project, set it as a work product, update the project state, removing intermediate work products. Lastly update the percent_complete field to reflect the progress made. Use your expertise and the provided tools to complete the project.

Current project state: ${JSON.stringify(stateCopy)}
Recent history: ${JSON.stringify(this.history)}
`;
        const response = await this.callLLM(prompt, prompt, tools, state);
        return {
            work_products: response
        };
    }

    async send(input) {
        const initialTask = input;
        let state = {
            subtasks: {},
            completedTasks: [],
            remainingTasks: [initialTask],
            workProducts: {},
            taskResponse: {},
            currentTask: '' ,
            percent_complete: 0,
            notes: '',
        };
        this.state = state;
        while (state.remainingTasks.length > 0) {
            state.currentTask = this.state.remainingTasks[0];
            console.log('current task:', state.currentTask);
            const res = await this.perform_task(state);
            state.taskResponse = res.work_products;
            await this.review_task(state);
            if (state.remainingTasks.length === 0 || state.percent_complete === 100) {
                console.log('No more tasks to process!');
                break;
            }
            console.log('Work products:', res.work_products);

        }
        console.log('Final work products:', state.workProducts);
        return state.workProducts;
    }
}


const assistant = new Assistant();


const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
})
.on('line', async (line) => {
    await assistant.send(line);
    rl.prompt();
})
.on('close', () => {
    process.exit(0);
});