// eval.ts
export default {
    schema: { "name": "output", "description": "Output data to the user in response to a query. valid types are `markdown`, 'text`, `html`, and `javascript`", "input_schema": { "type": "object", "properties": { "content": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
    action: async ({ content }: any, state: any, api: any) => {
        if(!state.responses) state.responses = [];
        content.forEach((element: any) => {
            if (element.type === 'markdown') {
                state.responses .push(`<markdown-view>${element.data}</markdown-view>`);
            }
            if (element.type === 'text') {
                state.responses .push(element.data);
            }
            if (element.type === 'html') {
                state.responses .push(`<html-component-view>${element.data}</html-component-view>`);
            }
            if (element.type === 'javascript') {
                state.responses .push(`<code-view>${element.data}</code-view>`);
            }
        });
        return state.responses;
    },
    nextState: null
}