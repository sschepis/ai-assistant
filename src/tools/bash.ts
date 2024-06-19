export default {
    schema: {
        "name": "bash",
        "description": "Run a bash command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string"
                },
                "args": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "command"
            ]
        }
    },
    action: async (params: any) => {
        try {
            const child_process = await import('child_process');
            const { exec } = child_process;
            const command = params.command;
            const args = params.args || [];
            return new Promise((resolve, reject) => {
                exec(`${command} ${args.join(' ')}`, (error: any, stdout: any, stderr: any) => {
                    if (error) {
                        console.log(`Error executing command: ${error.stack}`);
                        return resolve(`${error.stack}`);
                    }
                    if (stderr) {
                        console.log(`Error executing command: ${stderr}`);
                        return resolve(`${stderr}`);
                    }
                    if (!stdout || stdout.trim().length === 0) {
                        stdout = `Command ${command} executed successfully.`;
                    }
                    resolve(stdout);
                });
            });
        } catch (error: any) {
            console.log(`Error executing command: ${error.message}`);
            throw error;
        }
    },
    nextState: null,
}