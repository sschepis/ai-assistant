import fs from 'fs';
function getNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
export default {
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
    action: async ({ text, voice }: any, state: any, api: any) => {
      try {
        const PlayHT = await import('playht');
        const player = (await import('play-sound') as any)((error: any) => {
          if (error) {
            api.log(`Error playing sound: ${error}`, 'error');
          }
        });
        const apiKey = process.env.PLAYHT_AUTHORIZATION;
        const userId = process.env.PLAYHT_USER_ID;
        const maleVoice = process.env.PLAYHT_MALE_VOICE;
        const femaleVoice = process.env.PLAYHT_FEMALE_VOICE;
        if (!voice) voice = process.env.PLAYHT_FEMALE_VOICE;
        if (!apiKey || !userId || !maleVoice || !femaleVoice) {
          const missing = [];
          if (!apiKey) missing.push('playHT.apiKey');
          if (!userId) missing.push('playHT.userId');
          if (!maleVoice) missing.push('playHT.maleVoice');
          if (!femaleVoice) missing.push('playHT.femaleVoice');
          return `Missing configuration: ${missing.join(', ')} in configuration file. Please ask the user to provide the missing configuration using the ask_for_data tool.`;
        }
        PlayHT.init({ apiKey: apiKey, userId: userId, });
        const speakSentence = async (sentence: any, voice: any) => {
          if (!sentence) return;
          const stream = await PlayHT.stream(sentence, {
            voiceEngine: "PlayHT2.0-turbo",
            voiceId: voice === 'male' ? maleVoice : femaleVoice,
          });
          const chunks: any = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          return new Promise((resolve, reject) => {
            stream.on("end", () => {
              const buf = Buffer.concat(chunks);
              const filename = `${getNonce()}.mp3`;
              fs.writeFileSync(filename, buf);
              player.play(filename, function (err: any) {
                fs.unlinkSync(filename);
                resolve(`done`);
              });
            });
          })
        }
        let sentenceSplit = await api.callTool('callLLM', {
            prompt: `You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. 
        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**
        This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. 
        For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'
        When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.
        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**`,
            instructions: `You transform some given content into sentence-long fragments meant to be delivered to a text-to-speech agent. 
        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**
        This means you remove and rewrite content containing things like urls and file names so that they sound file when spoken. 
        For example, when you see 'https://google.com/foo-2' you output something like, 'https colon slash slash google dot com slash foo dash two'
        When creating your fragments, you should break fragments up by sentence if possible. Don't break up the sentence in places where having it in two fragments would sound weird.
        **Output your results as a JSON object with the format { fragments: string[] } Output RAW JSON only**`,
            tools: []
        });
       
        sentenceSplit = JSON.parse(sentenceSplit.choices[0].message.content);
        const sentences = sentenceSplit.fragments;
        const consumeSentence = async () => {
          return new Promise((resolve, reject) => {
            const loop: any = async () => {
              const sentence = sentences.shift();
              if (!sentence) return resolve('done');
              await speakSentence(sentence, voice);
              return await loop();
            };
            return loop();
          });
        };
        await consumeSentence();
        return text;
      } catch (error: any) {
        api.log(`Error saying text aloud: ${error.message}`, 'error');
        throw error;
      }
    },
    nextState: null
  }