const { execSync } = require('child_process');

/**
 * A versatile function that emulates busybox behavior in JavaScript.
 *
 * @param {string} command - The command to execute (e.g., 'ls', 'cat file.txt').
 * @param {string[]} [args=[]] - An array of arguments for the command.
 * @param {object} [options={}] - Optional settings for execution.
 * @returns {string|Buffer} - The output of the command, either as a string or Buffer.
 * @throws {Error} - If an invalid command is provided or execution fails.
 */
function jsBusybox(command: any, args: string[] = [], options: object = {}): string | Buffer {
  const supportedCommands: any = {
    // File system
    'ls': () => execSync(`ls ${args.join(' ')}`, options).toString().trim(),
    'cat': () => execSync(`cat ${args.join(' ')}`, options).toString(),
    'pwd': () => process.cwd(), // No need for execSync here
    'mkdir': () => execSync(`mkdir ${args.join(' ')}`, options),
    'touch': () => execSync(`touch ${args.join(' ')}`, options),
    'rm': () => execSync(`rm ${args.join(' ')}`, options),
    'cp': () => execSync(`cp ${args.join(' ')}`, options),
    'mv': () => execSync(`mv ${args.join(' ')}`, options),

    // System info
    'date': () => execSync('date', options).toString().trim(),
    'hostname': () => execSync('hostname', options).toString().trim(),
    'whoami': () => execSync('whoami', options).toString().trim(),
    'uptime': () => execSync('uptime', options).toString().trim(),

    // Network
    'ping': () => execSync(`ping ${args.join(' ')} -c 4`, options).toString(), // Ping with 4 packets by default

    // String manipulation
    'echo': () => args.join(' '),
    'grep': () => execSync(`grep ${args.join(' ')}`, options).toString(),
    'sed': () => execSync(`sed ${args.join(' ')}`, options).toString(), 
    'awk': () => execSync(`awk ${args.join(' ')}`, options).toString(),

    // Process management (simple examples)
    'ps': () => execSync('ps', options).toString(),
    'kill': () => {
      if (args.length === 0) {
        throw new Error('kill: missing process id');
      }
      return execSync(`kill ${args.join(' ')}`, options);
    },

    // Help
    'help': () => {
      return `Available commands:\n${Object.keys(supportedCommands).join('\n')}`;
    }
  };

  const cmdFunction = supportedCommands[command];

  if (cmdFunction) {
    try {
      return cmdFunction();
    } catch (error: any) {
      throw new Error(`Error executing '${command}': ${error.message}`);
    }
  } else {
    throw new Error(`Invalid command: '${command}'`);
  }
}

export default {
  schema: {
      "name": "busybox",
      "description": "A versatile function that emulates busybox behavior in JavaScript.",
      "input_schema": {
          "type": "object",
          "properties": {
              "command": {
                  "type": "string",
                  "description": "The command to execute (e.g., 'ls', 'cat file.txt')."
              },
              "args": {
                  "type": "array",
                  "description": "An array of arguments for the command."
              },
              "options": {
                  "type": "object",
                  "description": "Optional settings for execution."
              }
          }
      },
      "output_schema": {
          "type": "string",
          "description": "The output of the command, either as a string or Buffer."
      }
  },
  action: async (params: any, api: any) => {
      return jsBusybox(params.command, params.args, params.options);
  },
}