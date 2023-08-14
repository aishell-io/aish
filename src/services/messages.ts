
import sqlite3 from "sqlite3";
import { DB_SQLite3, MAX_MESSAGES } from '../constants.js'
import { postTopic, postTopicToOpenai } from '../services/chatgpt-api.js';

export class DialogMessage {
  role: string = '';
  content: string = '';
  id: number = 0;
  user_id: number = 0;
  created_at: number = 0;

  async populateWithData(id: number = 0, user_id: number = 0, created_at: number = 0, body: string = '') {
    this.id = id;
    this.user_id = user_id;
    this.created_at = created_at;
    this.role = user_id === 0 ? "user" : "assistant";
    this.content = body;
    return true;
  }

  async populate(id: number = 0): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Normal
        let sql = `SELECT id, user_id, body, created_at FROM messages WHERE id = ?`;
        let params = [id];

        // If id is 0, then get the last message.
        if (id === 0) {
          sql = `SELECT id, user_id, body, created_at FROM messages ORDER BY id DESC LIMIT 1`;
          params = [];
        }

        const db = new sqlite3.Database(DB_SQLite3);
        const that = this;
        db.get(sql, params, (err: any, row: any) => {
            if (err) {
              //console.error(err.message);
              resolve(false);
            } else {
              const result = row ? row : null;
              if (result) {
                that.id = result.id;
                that.user_id = result.user_id;
                that.created_at = result.created_at;
                that.role = result.user_id === 0 ? "user" : "assistant";
                that.content = result.body;
              }
              resolve(true);
            }
          }
        );
        db.close();
      } catch (err) {
        //console.log("error 1001");
        resolve(false);
      }
    });
  }
}

export class DialogTopic {
  topicId: number = 0;
  messages: Array<DialogMessage> = [];
  msgToSend: Array<any> = []; // to remove
  length: number = 0;

  // Last answer from ai.
  lastAnswer: string = '';

  // Full?
  full: boolean = false;

  constructor() {
    //this.messages = [];
  }

  /**
   * Assemble the messages of the last topic from the database.
   */
  async assemble() {
    return new Promise(async (resolve, reject) => {
      this.topicId = await getLastTopicId();
      const messages = await retrieveMessagesByTopicId(this.topicId);
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const role = message.user_id === 0 ? "user" : "assistant";
        const dm = new DialogMessage();
        dm.populateWithData(message.id, message.user_id, message.created_at, message.body);
        this.messages.push(dm);
        this.msgToSend.push({
          role: role,
          content: message.body,
        });
        this.length += message.body.length;
      }
      resolve(true);
    });
  }

  /**
   * Send the prompt including the topic.
   * @param prompt Send a message to model.
   */
  async send(prompt: string) {
    return new Promise(async (resolve, reject) => {

      try {
        this.msgToSend.push({
          role: "user",
          content: prompt
        });
        this.length += prompt.length;

        const key = process.env.KEY;

        let result: any = '';
        if (key) { // Personal key
          result = await postTopicToOpenai(prompt, this.topicId, this.msgToSend, key);
        } else {
          result = await postTopic(prompt, this.topicId, this.msgToSend);
        }
        //console.log(result);
        result = result ? result.trim() : '';
        this.lastAnswer = result;

        this.msgToSend.push({
          role: "assistant",
          content: result
        });
        this.length += result.length;

        // If messages are too long, create a new topic.
        if (this.length > MAX_MESSAGES) {
          this.full = true;
          await createTopic();
        }

        resolve(result)
      } catch (err) {
        console.log(err);
        resolve(err);
      }
    });
  }
}

/**
 * All messages number.
 * @returns Number of messages.
 */
export const countMessages = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(DB_SQLite3);
      db.get(
    	  `SELECT COUNT(*) AS count FROM messages`,
    	  (err: any, row: any) => {
    	    if (err) {
    	  	  //console.error(err.message);
    	  	  resolve(0);
    	    } else {
    	  	  const result = row ? row.count : 0;
    	  	  resolve(result);
    	    }
    	  }
      );
      db.close();
    } catch (err) {
      console.log("error 1001");
      resolve(0);
    }
  });
}

interface Message {
  id: number;
  user_id: number;
  body: string;
  created_at: number;
}

//interface Topic {
//  id: number;
//  title: string;
//  created_at: number;
//}

interface TopicMessage {
  tid: number;
  title: string;
  mid: number;
  body: string;
  created_at: number;
}

/**
 * Retrieve messages.
 * @param start Start row number.
 * @param end End row number.
 * @returns Messages
 */
export const retrieveMessages = (start = 1, end = 1): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(DB_SQLite3);
      const sql = `
        SELECT id, user_id, body FROM (
          SELECT
            ROW_NUMBER() OVER (ORDER BY id ASC) AS row_number,
            id,
            user_id,
            body
          FROM messages
        ) t
        WHERE row_number between ? and ?
      `;

      db.all(
        sql,
        [start, end],
    	  (err: any, row: any) => {
    	    if (err) {
    	  	  //console.error(err.message);
    	  	  resolve([]);
    	    } else {
    	  	  const result = row ? row : [];
    	  	  resolve(result);
    	    }
    	  }
      );
      db.close();
    } catch (err) {
      console.log("error 1002");
      resolve([]);
    }
  });
}

/**
 * Retrieve messages by topic id.
 * @param start Start row number.
 * @param end End row number.
 * @returns Messages
 */
export const retrieveMessagesByTopicId = (topicId: number): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(DB_SQLite3);
      const sql = `
        SELECT id, user_id, body, created_at
        FROM messages
        WHERE topic_id = ?
        ORDER BY id ASC
      `;

      db.all(
        sql,
        [topicId],
        (err: any, row: any) => {
          if (err) {
            resolve([]);
          } else {
            const result = row ? row : [];
            resolve(result);
          }
        }
      );
      db.close();
    } catch (err) {
      console.log("error 1005");
      resolve([]);
    }
  });
}

/**
 * Create a new topic.
 */
export const createTopic = async (): Promise<number> => {
  return new Promise ((resolve, reject) => {
    const newTopic = `INSERT INTO topics (title) VALUES ('')`
    const db = new sqlite3.Database(DB_SQLite3);
    let topicId = -1;
    db.serialize(() => {
      // Note: callback can't be an arrow function.
      // https://github.com/TryGhost/node-sqlite3/issues/962#issuecomment-377723980
      db.run(newTopic, [], function (err) {
        if (err) {
          console.log('Error 1003! Cannot create a topic.');
          //console.log(err);
        } else {
          const that = this as any
          if (that != undefined) {
            topicId = that.lastID;
          }
        }
        //console.log("\n=== New topic ===\n")
        resolve(topicId);
      });
    });

    db.close();
  })
} 

export const listTopics = (): Promise<TopicMessage[]> => {
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(DB_SQLite3);
      const sql = `
        SELECT t.id tid, t.title, t.created_at, m.id mid, m.body
        FROM topics t
        LEFT JOIN messages m ON t.id = m.topic_id
        ORDER BY t.id DESC, m.id ASC
      `;

      db.all(
        sql,
        [],
        (err: any, row: any) => {
          if (err) {
            resolve([]);
          } else {
            const result = row ? row : [];
            resolve(result);
          }
        }
      );
      db.close();
    } catch (err) {
      console.log("error 1006");
      resolve([]);
    }
  });
}

/**
 * Get the last topic id.
 */
export const getLastTopicId = async (): Promise<number> => {
  return new Promise ((resolve, reject) => {
    const lastTopic = `SELECT id FROM topics ORDER BY id DESC LIMIT 1`;
    const db = new sqlite3.Database(DB_SQLite3);
    db.get(lastTopic, [], async (err, row: any) => {
      if (err) {
        console.log('Error 1004! Cannot get the last topic id.');
        //console.log(err);
      } else {
        if (row) {
          // Found the last topic.
          resolve(row.id)
        } else {
          // Topics is empty, create a new one.
          const id = await createTopic();
          if (id > 0) {
    	      resolve(id);
          } else {
            reject(false)
          }
        }
      }
    });

    db.close();
  })
} 
