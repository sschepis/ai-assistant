import child_process from 'child_process';
export default {
    schema: { "name": "bash", "description": "Run a bash command", "input_schema": { "type": "object", "properties": { "command": { "type": "string" }, "args": { "type": "array" } } } },
    action: async (params: any, state: any, api: any) => {
        const { exec } = child_process;
        const command = params.command;
        const args = params.args || [];
        return new Promise((resolve, reject) => {
            exec(`${command} ${args.join(' ')}`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    reject(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`stderr: ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    },
    nextState: null
}