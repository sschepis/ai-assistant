import { WorkerStates } from '../constants';
import fs from 'fs'; 
import useStore from '../store'; // Import the zustand store

export default {
    schema: {
        "name": "saveFile",
        "description": "Save a file to the filesystem. Paths are reltive to the program install directory.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string"
                },
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
    action: async ({ path, content }: any) => {
        try {
            // get the program install directory
            const installDir = __dirname;
            // write the file
            const filePath = path.startsWith('/') ? path : `${installDir}/${path}`;
            fs.writeFileSync(filePath, content);
            return `File saved to ${filePath}`;
        }
        catch (error: any) {
            return `Error saving file: ${error.message}`;
        }
    }
}