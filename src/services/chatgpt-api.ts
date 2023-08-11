import axios from 'axios'
import sqlite3 from "sqlite3";
import { DEFAULT_API_URL, DB_SQLite3, API_OPENAI_MODEL } from '../constants.js'
import { DialogTopic, createTopic, getLastTopicId, retrieveMessagesByTopicId } from './messages.js';

export const getModels = async (key: string, modelName: string | boolean = false) => {
  return new Promise(async(resolve, reject) => {
    try {
      const headersRequest = {
        'Authorization': `Bearer ${key}`,
      };

      const r = await axios.get(API_OPENAI_MODEL, { headers: headersRequest });
      let models: Array<string> = [];
      for (let i=0; i<r.data.data.length; i++) {
        models.push(r.data.data[i].id);
        if (modelName && r.data.data[i].id === modelName) {
          console.log('Model found: ');
          console.log(r.data.data[i]);
          break;
        }
      }

      if (modelName) {
        resolve(true);
      } else {
        models.sort((a, b) => {
          return a.localeCompare(b);
        })

        for (let i=0; i<models.length; i++) {
          console.log(i+1, ':', models[i]);
        }
        resolve(models);
      }
    } catch (err) {
      // 404
      //console.log(err.response.data);
      console.log('Error! Cannot get models.');
      //console.log(err);
      resolve(false);
    }
  });
}

export const postTopic = async (prompt: string, topicId: number, messages: Array<any>) => {
  return new Promise(async(resolve, reject) => {
    const url = DEFAULT_API_URL

    try {
      const result = await axios.post(url, {
        msgtext: JSON.stringify(messages),
      })

      if (result && result.data && result.data.code && result.data.code === 1) {
        const aiAnswer = result.data.msg;
        const insertMessage = `
          INSERT INTO messages (
             user_id, body, topic_id, config_id, tag_ids, star
           )
           VALUES (?, ?, ?, ?, ?, ?),
                  (?, ?, ?, ?, ?, ?)
          `
        const db = new sqlite3.Database(DB_SQLite3);
        db.serialize(() => {
          db.run(insertMessage, [
            0, prompt, topicId, 0, '', 0,
            2, aiAnswer, topicId, 0, '', 0,
          ], (err) => {
            if (err) {
              console.log('Error 1002! Cannot insert message.');
              console.log(err);
            }
          });
        });

        db.close();

        resolve(aiAnswer);
      } else {
        reject(false);
      }
    } catch (err) {
      // 404
      //console.log(err);
      reject(err);
    }
  });
}


export const postTopicToOpenai = async (prompt: string, topicId: number, messagesArr: Array<any>, key: string) => {
  return new Promise(async(resolve, reject) => {
    const url = 'https://api.openai.com/v1/chat/completions'

    try {
      const headersRequest = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      };

      if (prompt.length < 2) {
        reject(false);
      }

      const messageSystem = [{"role": "system", "content": "You are a helpful assistant."}]
      const allMessages = messageSystem.concat(messagesArr);
      let body = {
        'model': global.currentModelName,
        'messages': allMessages,
      }
      const aiRes = await axios.post(url, body, { headers: headersRequest })

      if (aiRes.data.choices && aiRes.data.choices.length > 0) {
        const aiAnswer = aiRes.data.choices[0].message.content
        const insertMessage = `
          INSERT INTO messages (
             user_id, body, topic_id, config_id, tag_ids, star
           )
           VALUES (?, ?, ?, ?, ?, ?),
                  (?, ?, ?, ?, ?, ?)
          `
        const db = new sqlite3.Database(DB_SQLite3);
        db.serialize(() => {
          db.run(insertMessage, [
            0, prompt, topicId, 0, '', 0,
            2, aiAnswer, topicId, 0, '', 0,
          ], (err) => {
            if (err) {
              console.log('Error 1002! Cannot insert message.');
              console.log(err);
            }
          });
        });

        db.close();

        resolve(aiAnswer);
      } else {
        reject(false);
      }
    } catch (err) {
      // 404
      //console.log(err);
      reject(err);
    }
  });
}

export const talkToModel = async (prompt: string) => {
  return new Promise(async(resolve, reject) => {
    const topic = new DialogTopic();
    await topic.assemble();
    await topic.send(prompt);
    console.log(topic.lastAnswer);
    resolve(true);
  });
}
