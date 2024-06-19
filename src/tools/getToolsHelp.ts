export default {
    schema: {
        "name": "getToolsHelp",
        "description": "Get help for the available tools",
        "input_schema": {
            "type": "object",
            "properties": {}
        },
    },
    action: async (_: any, api: any) => { 
        return Object.keys(api.tools).map((toolName: any) => (`${toolName}: ${api.tools[toolName].schema.description}`));
    }
}