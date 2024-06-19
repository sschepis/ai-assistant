import { WorkerStates } from '../constants';

export default {
    schema: {
        "name": "reviewWorkProducts",
        "description": "Review the generated work product for the current task, submit a updated work product and close the task if its complete",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    action: async (_: any, api: any) => {
        console.log('Reviewing work products...');
        const state = api.store.getState(); // Get the current state from the zustand store
        const currentTask = state.currentTask;
        const workProducts = state.currentTask?.workProducts;
        if (!workProducts) { return 'No work products found for the task ' + currentTask; }
        const ret = await api.callTool('callLLM', {
            prompt: `Your goal is to review the generated work products for the current task and output a refined work product, whether the current task is complete, and an updated percent complete for the overall project IN JSON FORMAT with format { workProduct: string, currentTaskComplete: boolean, percentComplete: number }.  The current project state is: ${JSON.stringify(state)}. Return your response in JSON format using format { workProduct: string, currentTaskComplete: boolean, percentComplete: number }.`,
            instructions: 'You are an expert agent operating in an autonomous execution context. Your goal is to review the generated work products for the current task and output an updated work product and percentComplete estimate. The current workspace folder is: ' + process.cwd() + '. You are operating on a ' + process.platform + ' machine. *** RETURN ALL RESPONSES USING FORMAT { workProduct: string, currentTaskComplete: boolean, percentComplete: number } ***',
            tools: []
        })
        try {
            let item = ret[0];
            try {
                item = JSON.parse(item.text || item);
            } catch (error: any) { }
            if(item.workProduct) item.addWorkProductToCurrentTask(item.workProduct);
            if(item.percentComplete) state.setState({ ...state, percentComplete: item.percentComplete });
            if (item.currentTaskComplete) {
                console.log(`Task ${state.currentTask.name} is complete.`);
                state.completeCurrentTask();
            }
        } catch (error: any) { }
    }
}