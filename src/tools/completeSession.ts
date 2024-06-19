import { WorkerStates } from '../constants';
import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "completeSession",
        "description": "Complete the current session",
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
        console.log('session completed')
        useStore.getState().completeCurrentSession()
        return 'Session completed.'
    }
}