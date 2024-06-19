import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "saveTool",
        "description": "Save a tool to the tools folder.",
        "input_schema": {
            "type": "object",
            "properties": {
                "content": {
                    "type": "string"
                }
            },
            "required": [
                "path",
                "content"
            ]
        }
    },
    action: async ({ content }: any, api: any) => {
        try {
            api.callTool('save_file', { path: `./tools/${content.name}.ts`, content: content });
        }
        catch (error: any) {
            return `Error saving tool: ${error.message}`;
        }
    }
}