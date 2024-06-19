import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "performTask",
        "description": "Perform the given task. Generates work products and updates the project state.",
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string"
                }
            },
            "required": [
                "task"
            ]
        }
    },
    action: async ({ task }: any, api: any) => {
        const state = useStore.getState(); // Get the current state from the zustand store
        console.log(`Performing task: ${task}`);
        const toolsHelp = JSON.stringify(await api.callTool('getToolsHelp', {}));
        const resp: any = async (_useTools: boolean, firstResponse: string): Promise<any> => {
            const theTools: any = Object.keys(api.tools).map((toolName: any) => api.tools[toolName].schema);
            delete theTools.getNextAction;

            let response = await api.callTool('callLLM', {
                prompt: _useTools ? 
                `Your goal is to perform the given task to the best of your abilities using a creative combination of your innate skills and tooling.\n\nYou previously determined that you need tools to complete the following task:\n\nTask: ${task}\n\nYou mentioned the following tools:\n${firstResponse}\n\nCurrent project state: ${JSON.stringify(state)}\n\nRecent history: ${JSON.stringify(state.history || "No history yet.")} yeah\n\nInstructions:\n- Use the provided tools to perform the task and generate the work product(s).\n- Determine the overall percent completion of the project and update the percent complete field in the project state.` 
                : 
                `Your goal is to perform the given task to the best of your abilities using a creative combination of your innate skills and tooling.\n\nTask: ${task}\n  \nCurrent project state: ${JSON.stringify(state)}\n  \nRecent history: ${JSON.stringify(state.history || "No history yet")}\n  \nInstructions:\n- Analyze the task and determine if you can complete it without using any tools.\n- If you can complete the task without tools, perform the task and return the generated work product(s) in the specified JSON format. DO NOT EMBED TOOL CALLS IN WORK PRODUCTS!\n- If you require tools to complete the task, list the specific tools you would use and describe how you would use them to perform the task. Do not actually call the tools.\n\nThe list of available tools are: ${toolsHelp}\n  \nResponse Format (without tools):\nIf completing the task without tools, return the work product(s) in the following JSON format (exclude the angled brackets):\n<{\n  "workProducts": [\n    {\n      "type": "file/chat",\n      "name": <optional_name>,\n      "data": <work_product_content>\n    },\n    ...n  ]\n}>\n  \nIf tools are required, provide your response in json format as follows:\n{\n  "tools": [{\n    name: "tool_name",\n    parameters: {\n      "param1": "value1",\n      "param2": "value2",\n      ...\n    }\n  }, ...]\n}\n\n*** YOU MUST ONLY RETURN JSON FORMATTED DATA. DO NOT INCLUDE ANY ADDITIONAL TEXT OR CODE BLOCKS IN YOUR RESPONSE. ***`,
                instructions: 'Your goal is to perform the given task to the best of your abilities. The current workspace folder is: ' + process.cwd() + '. This machine is a ' + process.platform + ' machine. OUTPUT JSON ONLY!!!',
                tools: _useTools ? theTools : [],
            });
            try {   
                if(!Array.isArray(response)) response = [response];
                let toolsUsed = false;
                const results: any = [];
                for(const ri of response) {
                    if (!_useTools && ri.tools) {
                        if (!Array.isArray(ri.tools)) {
                            ri.tools = [ri.tools];
                        }
                        toolsUsed = true;
                        return await api.callTools(ri.tools, state);
                    } else if (!_useTools && ri.workProducts) {
                        results.push(ri.workProducts);
                    } else {
                        results.push(ri);
                    }
                }    
                if(!toolsUsed) {
                    return await resp(true, JSON.stringify(results));
                } else {
                    return results;
                }
            } catch (error: any) {
                return response[0].text || response[0];
            }
        }
        return resp(false, '');
    }
}