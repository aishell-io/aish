import { Hook } from "@oclif/core";
import sqlite3 from "sqlite3";
import * as fs from "fs";

import { HOME_DIR, DB_SQLite3, CONFIG_FILE, MODELS } from "../constants.js";

// Config
import * as dotenv from "dotenv";
dotenv.config({ path: CONFIG_FILE });

// Set the current model
let modelName = process.env.MODEL;
if (modelName) {
  global.currentModelName = modelName;
} else {
  global.currentModelName = MODELS[0];
}

function createSqlite3() {
  return new Promise((resolve, reject) => {
    try {
      const db = new sqlite3.Database(DB_SQLite3);

      db.serialize(
        () => {
          db.run(
            `
            CREATE TABLE topics (
              id INTEGER PRIMARY KEY,
              title TEXT,
              created_at INTEGER(4) NOT NULL DEFAULT (STRFTIME('%s', 'now')),
              updated_at INTEGER(4) NOT NULL DEFAULT (STRFTIME('%s', 'now'))
            )`,
            (err) => {
              if (err) {
                console.error(err.message);
                resolve(false);
              } else {
                //console.log("Created topics table");
              }
            }
          ).run(
            `
            CREATE TABLE messages (
              id INTEGER PRIMARY KEY,
              user_id INTEGER NOT NULL DEFAULT 0,
              topic_id INTEGER,
              body TEXT NOT NULL DEFAULT '',
              config_id INTEGER NOT NULL DEFAULT 0,
              tag_ids TEXT,
              star INTEGER,
              created_at INTEGER(4) NOT NULL DEFAULT (STRFTIME('%s', 'now'))
            )`,
            (err) => {
              if (err) {
                console.error(err.message);
                resolve(false);
              }
              //console.log("Created messages table");
            }
          );
        }
      )
      db.close();

      resolve(true)
    } catch (err) {
      console.log('err: ', err)
      reject(err)
    }
  });
}

// Sqlite3
//export const sqlite3;
const hook: Hook<"init"> = async function (opts) {
  // Root directory
  if (!fs.existsSync(HOME_DIR)) {
    //fs.mkdirSync(configDir, { recursive: true });
    fs.mkdirSync(HOME_DIR);
  }

  // DB
  //const dbPath = path.join(aishellDir, "db.sqlite3");
  if (!fs.existsSync(DB_SQLite3)) {
    try {
      await createSqlite3();
    } catch (err) {
      console.error(err);
      process.exit();
    }
  }
};

export default hook;
