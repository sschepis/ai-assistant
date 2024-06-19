import { WorkerStates } from '../constants';
export default {
    schema: {
        "name": "reset",
        "description": "Reset the process state.",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    action: async (_: any, api: any) => { api.store.setState(api.store.getState().initialState); return 'State reset.' } // Reset the state to the initial state using zustand
}