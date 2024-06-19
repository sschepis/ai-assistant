import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "decideNextAction",
        "description": "Decide the next action to take based on the current state",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    action: async (_: any, api: any) => {
        console.log('Deciding next action...');
        const state = useStore.getState(); // Get the current state from the zustand store
        const remainingTasks = state.remainingTasks;
        const currentTask = state.currentTask;
        if (remainingTasks.length === 0 && !currentTask) { return api.callTool('completeSession', {}); }
        const results = await api.callTool('callLLM', {
            prompt:`Your goal is to determine the next course of action to take given the current project state. Typically this will involve complete the current task using the \`completeTask\` function to complete the task, but you can call any function you deem appropriate. The current project state is: ${JSON.stringify(state)}`,
            instructions: 'You are an expert agent operating in an autonomous execution context. Your goal is to determine the next course of action to take given the current project state. The current workspace folder is: ' + process.cwd() + '. You are operating on a ' + process.platform + ' machine.',
            tools: Object.keys(api.tools).map((toolName: any) => api.tools[toolName].schema)
        });
        const nextAction = results[0].text || results[0];
        console.log(`Next action: ${nextAction}`);
        return nextAction;
    }
}