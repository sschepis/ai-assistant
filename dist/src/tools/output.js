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
// eval.ts
exports.default = {
    schema: { "name": "output", "description": "Output data to the user in response to a query. valid types are `markdown`, 'text`, `html`, and `javascript`", "input_schema": { "type": "object", "properties": { "content": { "type": "array", "items": { "data": "string", "type": "string" } } } } },
    action: ({ content }, state, api) => __awaiter(void 0, void 0, void 0, function* () {
        if (!state.responses)
            state.responses = [];
        content.forEach((element) => {
            if (element.type === 'markdown') {
                state.responses.push(`<markdown-view>${element.data}</markdown-view>`);
            }
            if (element.type === 'text') {
                state.responses.push(element.data);
            }
            if (element.type === 'html') {
                state.responses.push(`<html-component-view>${element.data}</html-component-view>`);
            }
            if (element.type === 'javascript') {
                state.responses.push(`<code-view>${element.data}</code-view>`);
            }
        });
        return state.responses;
    }),
    nextState: null
};
