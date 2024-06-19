import fs from 'fs';

export default {
    schema: {
        "name": "listTools",
        "description": "List either just loaded tools or all tools. Set all to true to list all tools. Returns an array of tool names.",
        "input_schema": {
            "type": "object",
            "properties": {
                "all": {
                    "type": "boolean"
                }
            }
        }
    },
    action: async ({ all }: any, api: any) => {
        if (all) {
            const tools = fs.readdirSync('./tools');
            return tools.map((tool: string) => tool.replace('.ts', ''));
        } else {
            return Object.keys(api.tools);
        }
    }
}