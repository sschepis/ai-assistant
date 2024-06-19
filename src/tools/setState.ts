import { WorkerStates } from '../constants';
import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "setState",
        "description": "Set a state object by key",
        "input_schema": {
            "type": "object",
            "properties": {
                "state": {
                    "type": "object"
                }
            },
            "required": [
                "state"
            ]
        }
    },
    action: async ({ state }: any) => useStore.setState(state) // Use the zustand store's setState method
}