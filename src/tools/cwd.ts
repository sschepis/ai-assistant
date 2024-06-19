export default {
    schema: {
        "name": "cwd",
        "description": "Get the current working directory",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    action: async () => {
        try {
            const result = process.cwd();
            return result;
        } catch (error: any) {
            console.log(`Error getting current working directory: ${error.message}`);
            throw error;
        }
    },
}