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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function getOrCreateFile(filename, defaultContent) {
    if (!fs_1.default.existsSync(filename)) {
        fs_1.default.writeFileSync(filename, defaultContent);
    }
    return fs_1.default.readFileSync(filename, 'utf-8');
}
exports.default = {
    enabled: false,
    tools: {
        learned_skills_list: {
            schema: {
                "name": "learned_skills_list",
                "description": "List all the learned skills that you have available",
                "input_schema": {
                    "type": "object",
                    "properties": {}
                }
            },
            action: () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    return getOrCreateFile('./skills.json', '{}');
                }
                catch (err) {
                    return JSON.stringify(err.message);
                }
            })
        },
        learned_skill_details: {
            schema: {
                "name": "learned_skill_details",
                "description": "Get the details of how to perform a learned skill",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "skill": {
                            "type": "string",
                            "description": "The name of the skill to get"
                        }
                    },
                    "required": ["skill"]
                }
            },
            action: ({ skill }) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const sf = getOrCreateFile('./skills.json', '{}');
                    const skills = JSON.parse(sf.toString());
                    const skillDetail = skills[skill];
                    if (!skillDetail) {
                        return `Skill ${skill} not found`;
                    }
                    return skillDetail;
                }
                catch (err) {
                    return JSON.stringify(err.message);
                }
            })
        },
        learned_skill_save_details: {
            schema: {
                "name": "learned_skill_save_details",
                "description": "Save the details of how to perform a learned skill",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "skill": {
                            "type": "string",
                            "description": "The name of the skill to get"
                        },
                        "skillDetail": {
                            "type": "string",
                            "description": "The details of the skill"
                        }
                    },
                    "required": ["skill", "skillDetail"]
                }
            },
            action: ({ skill, skillDetail }) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const sf = getOrCreateFile('./skills.json', '{}');
                    const skills = JSON.parse(sf.toString());
                    skills[skill] = skillDetail;
                    fs_1.default.writeFileSync('./skills.json', JSON.stringify(skills));
                    return `Skill ${skill} set`;
                }
                catch (err) {
                    return JSON.stringify(err.message);
                }
            })
        },
        learned_skills_help: {
            schema: {
                "name": "learned_skills_help",
                "description": "Get help for the learned skills module",
                "input_schema": {
                    "type": "object",
                    "properties": {}
                }
            },
            action: () => __awaiter(void 0, void 0, void 0, function* () {
                return `This module allows you to store and retrieve learned skills. You can list all the learned skills, get the details of a specific skill, and save the details of a specific skill.`;
            })
        }
    }
};
