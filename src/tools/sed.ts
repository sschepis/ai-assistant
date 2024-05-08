import fs from 'fs';
export default {
  enabled: true,
  tools: {
    sed_string: {
      schema: {
        "name": "sed_string",
        "description": "Perform sed operations on a given string",
        "input_schema": {
          "type": "object",
          "properties": {
            "inputString": {
              "type": "string",
              "description": "The input string to be transformed"
            },
            "pattern": {
              "type": "string",
              "description": "The sed pattern to apply"
            }
          },
          "required": ["inputString", "pattern"]
        }
      },
      action: async ({ inputString, pattern }: any) => {
        try {
          const sed: any = await import('sed-lite');
          return sed(inputString, pattern);
        } catch (err: any) {
          return JSON.stringify(err.message);
        }
      }
    },

    sed_file: {
      schema: {
        "name": "sed_file",
        "description": "Perform sed operations on the contents of a file",
        "input_schema": {
          "type": "object",
          "properties": {
            "filePath": {
              "type": "string",
              "description": "The path of the file to be transformed"
            },
            "pattern": {
              "type": "string",
              "description": "The sed pattern to apply"
            }
          },
          "required": ["filePath", "pattern"]
        }
      },
      action: async ({ filePath, pattern }: any) => {
        try {
          if (!fs.existsSync(filePath)) {
            return `File not found: ${filePath}`;
          }
          const sed: any = await import('sed-lite');
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const transformedContent = sed(fileContent, pattern);
          fs.writeFileSync(filePath, transformedContent);
          return `File transformed successfully.`;
        } catch (err: any) {
          return JSON.stringify(err.message);
        }
      }
    }
  }
};
