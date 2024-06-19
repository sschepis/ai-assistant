import { WorkerStates } from '../constants';
import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "completeTask",
        "description": "Complete the current task",
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
    action: async ({ task }: any) => useStore.getState().completeCurrentTask() // Use the zustand store's completeCurrentTask method
}