"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
function getNonce() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
exports.default = {
    "schema": {
        "name": "say",
        "description": "Say the given text aloud using a natural voice",
        "input_schema": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The text to say"
                },
                "voice": {
                    "type": "string",
                    "description": "The voice to use (can be 'male' or 'female'). If not specified, the default female voice will be used"
                }
            },
            "required": ["text"]
        }
    },
    action: function (_a, state, api) {
        var text = _a.text, voice = _a.voice;
        return __awaiter(void 0, void 0, void 0, function () {
            var PlayHT_1, player_1, apiKey, userId, maleVoice_1, femaleVoice_1, missing, speakSentence_1, sentenceSplit, sentences_1, consumeSentence, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('playht')); })];
                    case 1:
                        PlayHT_1 = _b.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('play-sound')); })];
                    case 2:
                        player_1 = (_b.sent())(function (error) {
                            if (error) {
                                api.log("Error playing sound: ".concat(error), 'error');
                            }
                        });
                        apiKey = process.env.PLAYHT_AUTHORIZATION;
                        userId = process.env.PLAYHT_USER_ID;
                        maleVoice_1 = process.env.PLAYHT_MALE_VOICE;
                        femaleVoice_1 = process.env.PLAYHT_FEMALE_VOICE;
                        if (!voice)
                            voice = process.env.PLAYHT_FEMALE_VOICE;
                        if (!apiKey || !userId || !maleVoice_1 || !femaleVoice_1) {
                            missing = [];
                            if (!apiKey)
                                missing.push('playHT.apiKey');
                            if (!userId)
                                missing.push('playHT.userId');
                            if (!maleVoice_1)
                                missing.push('playHT.maleVoice');
                            if (!femaleVoice_1)
                                missing.push('playHT.femaleVoice');
                            return [2 /*return*/, "Missing configuration: ".concat(missing.join(', '), " in configuration file. Please ask the user to provide the missing configuration using the ask_for_data tool.")];
                        }
                        PlayHT_1.init({ apiKey: apiKey, userId: userId, });
                        speakSentence_1 = function (sentence, voice) { return __awaiter(void 0, void 0, void 0, function () {
                            var stream, chunks;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!sentence)
                                            return [2 /*return*/];
                                        return [4 /*yield*/, PlayHT_1.stream(sentence, {
                                                voiceEngine: "PlayHT2.0-turbo",
                                                voiceId: voice === 'male' ? maleVoice_1 : femaleVoice_1,
                                            })];
                                    case 1:
                                        stream = _a.sent();
                                        chunks = [];
                                        stream.on("data", function (chunk) { return chunks.push(chunk); });
                                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                                stream.on("end", function () {
                                                    var buf = Buffer.concat(chunks);
                                                    var filename = "".concat(getNonce(), ".mp3");
                                                    fs_1.default.writeFileSync(filename, buf);
                                                    player_1.play(filename, function (err) {
                                                        fs_1.default.unlinkSync(filename);
                                                        resolve("done");
                                                    });
                                                });
                                            })];
                                }
                            });
                        }); };
                        return [4 /*yield*/, api.callTool('callLLM', {
                                prompt: "You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. \n        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**\n        This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. \n        For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'\n        When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.\n        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**",
                                instructions: "You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. \n        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**\n        This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. \n        For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'\n        When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.\n        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**",
                                tools: api.tools
                            })];
                    case 3:
                        sentenceSplit = _b.sent();
                        sentenceSplit = JSON.parse(sentenceSplit.choices[0].message.content);
                        sentences_1 = sentenceSplit.fragments;
                        consumeSentence = function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                        var loop = function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var sentence;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        sentence = sentences_1.shift();
                                                        if (!sentence)
                                                            return [2 /*return*/, resolve('done')];
                                                        return [4 /*yield*/, speakSentence_1(sentence, voice)];
                                                    case 1:
                                                        _a.sent();
                                                        return [4 /*yield*/, loop()];
                                                    case 2: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); };
                                        return loop();
                                    })];
                            });
                        }); };
                        return [4 /*yield*/, consumeSentence()];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, text];
                    case 5:
                        error_1 = _b.sent();
                        api.log("Error saying text aloud: ".concat(error_1.message), 'error');
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    nextState: null
};
