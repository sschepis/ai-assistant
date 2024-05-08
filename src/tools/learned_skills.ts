import fs from 'fs';

function getOrCreateFile(filename: any, defaultContent: any) {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, defaultContent);
    }
    return fs.readFileSync(filename, 'utf-8');
}

export default {
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
            action: async () => {
                try {
                    return getOrCreateFile('./skills.json', '{}');
                } catch (err: any) {
                    return JSON.stringify(err.message);
                }
            }
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
            action: async ({ skill }: any) => {
                try {
                    const sf = getOrCreateFile('./skills.json', '{}');
                    const skills = JSON.parse(sf.toString());
                    const skillDetail = skills[skill];
                    if (!skillDetail) {
                        return `Skill ${skill} not found`;
                    }
                    return skillDetail;
                } catch (err: any) {
                    return JSON.stringify(err.message);
                }
            }
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
            action: async ({ skill, skillDetail }: any) => {
                try {
                    const sf = getOrCreateFile('./skills.json', '{}');
                    const skills = JSON.parse(sf.toString());
                    skills[skill] = skillDetail;
                    fs.writeFileSync('./skills.json', JSON.stringify(skills));
                    return `Skill ${skill} set`;
                } catch (err: any) {
                    return JSON.stringify(err.message);
                }
            }
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
            action: async () => {
                return `This module allows you to store and retrieve learned skills. You can list all the learned skills, get the details of a specific skill, and save the details of a specific skill.`
            }
        }
    }
}
