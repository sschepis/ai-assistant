// eval.ts
export default {
    schema: { "name": "eval", "description": "Evaluate a JavaScript expression", "input_schema": { "type": "object", "properties": { "expression": { "type": "string" } } } },
    action: async (params: any, state: any, api: any) => { return eval(params.expression); },
    nextState: null
}