export default {
    schema: { "name": "image-generate", "description": "Generate an image", "input_schema": { "type": "object", "properties": { "model": { "type": "string", "description": "The model to use for generating the image" }, "prompt": { "type": "string", "description": "The prompt to use for generating the image" }, "response_format": { "type": "string", "description": "The format of the response: url, base64, or json" }, "n": { "type": "integer", "description": "The number of images to generate" } }, "required": ["prompt"] } },
    action: async ({ model, prompt, response_format, n }: any, state: any, api: any) => {
        const response = await api.callAPI('images', 'generations', { model, prompt, response_format, n });
        return response;
    },
    nextState: null
}