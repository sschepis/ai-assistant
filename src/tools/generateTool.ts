import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "generateTool",
        "description": "Generate a software tool based on the provided task, and return the generated function as a string",
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string"
                }
            },
            "required": [
                "task",
                "format"
            ]
        },
        "output_schema": {
            "type": "string"
        }
    },
    action: async ({ task }: any, api: any) => {
        console.log('Generating tool...');
        const state = useStore.getState(); // Get the current state from the zustand store
        const results = await api.callTool('callLLM', {
            prompt: `Generate a software function that accomplishes the given task. The software function should be generated using the below format:

{
schema: {
"name": "eval",
"description": "Evaluate a JavaScript expression and return its result",
"input_schema": {
"type": "object",
"properties": {
    "expression": {
        "type": "string"
    }
},
"required": [
    "expression"
]
},
"output_schema": {
"type": "any"
}
},
action: async ({ expression }: any) => {
try {
return eval(expression);
} catch (error: any) {
return \`Error evaluating JavaScript expression: \${error.message}\`;
}
},
}

The task is: "${task}"

Output ONLY THE RAW OUTPUT STARTING WITH { and ENDING WITH } WITHOUT ANY COMMENTARY`,
            instructions: `Your goal is to generate a software tool using Javascript that fulfills the requirements you are given. This tool is being generated in response to an arising need in the course of implementing a projject with the following state, provided for your reference. The current project state is: ${JSON.stringify(state)}`,
            tools: Object.keys(api.tools).map((toolName: any) => api.tools[toolName].schema)
        });
        const nextAction = results[0].text || results[0];
        console.log(`Next action: ${nextAction}`);
        return nextAction;
    }
}