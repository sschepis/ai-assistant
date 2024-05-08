"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    schema: { "name": "image-generate", "description": "Generate an image", "input_schema": { "type": "object", "properties": { "model": { "type": "string", "description": "The model to use for generating the image" }, "prompt": { "type": "string", "description": "The prompt to use for generating the image" }, "response_format": { "type": "string", "description": "The format of the response: url, base64, or json" }, "n": { "type": "integer", "description": "The number of images to generate" } }, "required": ["prompt"] } },
    action: ({ model, prompt, response_format, n }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.callAPI('images', 'generations', { model, prompt, response_format, n });
        return response;
    }),
    nextState: null
};
