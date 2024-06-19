import axios from 'axios';
import { WorkerStates } from '../constants';
import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "callLLM",
        "description": "Call the LLM with the given prompt and instructions (system prompt).",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string"
                },
                "instructions": {
                    "type": "string"
                },
                "tools": {
                    "type": "boolean"
                },
            },
            "required": [
                "prompt",
                "instructions"
            ]
        }
    },
    action: async ({ prompt, instructions, tools, model = 'claude-3-opus-20240229' }: any, api: any) => {
        try {
            const state = useStore.getState(); // Get the current state from the zustand store
            const schemas = tools //? Object.keys(tools).map((toolName: any) => tools[toolName].schema) : [];
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: model, max_tokens: 4000,
                system: instructions, tools: schemas,
                messages: [{ role: 'user', content: prompt, },],
            }, {
                headers: {
                    'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01', 'anthropic-beta': 'tools-2024-04-04',
                },
            });
            const data = response.data;
            let result: any = [];
            let toolCalls: any = [];
            if (Array.isArray(data.content)) {
                data.content = data.content.map((item: any) => {
                    if (item.type === 'tool_use') {
                        item.parameters = item.input;
                        toolCalls.push(item);
                        console.log('tool_call', item);
                    } else {
                        try {
                            const ret = JSON.parse(item.text);
                            if (ret.tools) {
                                toolCalls = [...toolCalls, ...ret.tools];
                            } else {
                                result.push(ret);
                            }
                            if(ret.percentComplete) {
                                useStore.setState({ ...state, percentComplete: ret.percentComplete }); // Update the state using zustand
                            }
                            if(ret.currentTaskComplete) {
                                if(state.currentTask) console.log(`Task ${state.currentTask.name} is complete.`);
                                useStore.getState().completeCurrentTask();
                            }
                        }
                        catch (error: any) {
                            result.push(item.text);
                            console.log(item.text);
                        }
                    }
                });
                const toolsResult = await api.callTools(toolCalls, state); // Call the callTools function with the updated state
                result = [...result, ...toolsResult];
            }
            return result;
        } catch (error: any) {
            throw error;
        }
    }
}
