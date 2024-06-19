export default {
    schema: {
        "name": "setCwd",
        "description": "Set the current working directory",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string"
                }
            },
            "required": [
                "path"
            ]
        }
    },
    action: async (params: any) => {
        try {
            process.chdir(params.path);
            const result = process.cwd();
            return result;
        } catch (error: any) {
            console.log(`Error setting current working directory: ${error.message}`);
            throw error;
        }
    },
}