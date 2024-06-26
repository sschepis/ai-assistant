export default {
    schema: {
        "name": "eval",
        "description": "Evaluate a JavaScript expression",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string"
                }
            },
            "required": [
                "expression"
            ]
        }
    },
    action: async (params: any) => {
        try {
            const result = eval(params.expression);
            return result;
        }
        catch (error: any) {
            console.log(`Error evaluating JavaScript expression: ${error.message}`);
            throw error;
        }
    },
}