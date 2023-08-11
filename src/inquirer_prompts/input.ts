import {
  createPrompt,
  useState,
  useKeypress,
  isSpaceKey,
  isEnterKey,
  isUpKey,
  isDownKey,
  isBackspaceKey,
  AsyncPromptConfig,
} from '@inquirer/core';
import type {} from '@inquirer/type';
import chalk from 'chalk';
import sqlite3 from "sqlite3";
import { HOME_DIR, DB_SQLite3 } from "../constants.js";
import { DialogMessage } from '../services/messages.js';
import { toConfiguredId } from '@oclif/core';

import dayjs from 'dayjs';
import { exit } from 'process';

import clipboard from 'clipboardy';

let currentId = 0;
let currentDialogMessage = new DialogMessage();

interface Message {
  id: number;
  user_id: number;
  body: string;
  created_at: number;
}


/**
 * User pressed up or down arrow key.
 * @param arrow Arrow key pressed (up or down)
 * @param id Message ID
 * @returns 
 */
function getNextMessage(arrow = 'up'): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // If up and currentId > 0.
      let sql = `SELECT id, user_id, body, created_at FROM messages WHERE id < ? ORDER BY id DESC LIMIT 1`;
      // todo: currentDialogMessage.id maybe undefined.
      let params = [currentDialogMessage.id];

      // If down and currentId is 0, then we are at the bottom of the list,
      // default sql result (id < 0) is none, so return empty string. It's ok.
      //if (arrow === 'down' && currentId === 0) {
      //}

      if (arrow === 'down') {
        sql = `SELECT id, user_id, body, created_at FROM messages WHERE id > ? ORDER BY id ASC LIMIT 1`;
      }

      //console.log('sql: ', sql)
      const db = new sqlite3.Database(DB_SQLite3);
      db.get(sql, params, (err: any, row: any) => {
          if (err) {
            //console.error(err.message);
            resolve(false);
          } else {
            if (row && row.id) {
              currentDialogMessage.populateWithData(row.id, row.user_id, row.created_at, row.body);
              resolve(true);
            } else {
              resolve(false)
            }
          }
        }
      )
      db.close();
    } catch (err) {
      resolve(false);
    }
  });
}

type InputConfig = AsyncPromptConfig & {
  default?: string;
  transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
};

export default createPrompt<string, InputConfig>((config, done) => {
  const [status, setStatus] = useState<string>('pending');
  const [defaultValue, setDefaultValue] = useState<string | undefined>(config.default);
  const [errorMsg, setError] = useState<string | undefined>(undefined);
  const [value, setValue] = useState<string>('');

  const isLoading = status === 'loading';
  //const prefix = '>';

  useKeypress(async (key, rl) => {
    // Ignore keypress while our prompt is doing other processing.
    if (status !== 'pending') {
      return;
    }

    global.browseSpaceKeypress = false;
    global.copied = false;

    let r: any;

    if (isSpaceKey(key)) {
      const answer = value || defaultValue || '';
      setStatus('loading');
      const isValid = await config.validate(answer);
      global.browseSpaceKeypress = true;
      if (isValid === true) {
        setValue(answer);
        setStatus('done');
        done(answer);
      } else {
        // TODO: Can we keep the value after validation failure?
        // `rl.line = value` works but it looses the cursor position.
        setValue('');
        setError(isValid || 'You must provide a valid value');
        setStatus('pending');
      }
    } else if (isEnterKey(key) || key.name === 'q') {
      const answer = value || defaultValue || '';
      setStatus('loading');
      const isValid = await config.validate(answer);
      if (isValid === true) {
        setValue(answer);
        setStatus('done');
        done(answer);
      } else {
        // TODO: Can we keep the value after validation failure?
        // `rl.line = value` works but it looses the cursor position.
        setValue('');
        setError(isValid || 'You must provide a valid value');
        setStatus('pending');
      }
    } else if (isUpKey(key) || key.name === 'k') {
      let answerExists: boolean = false; 
      if (currentDialogMessage.id === 0) {
        answerExists = await currentDialogMessage.populate();
      } else {
        answerExists = await getNextMessage('up');
      }

      if (answerExists) {
        currentId = currentDialogMessage.id;
        rl.write(null, { ctrl: true, name: 'u' }); // clear line
        rl.write(currentDialogMessage.content);
        const u = currentDialogMessage.user_id === 0 ? 'You:' : 'gpt-3.5-turbo:';
        const dj = dayjs.unix(currentDialogMessage.created_at);
        r = `\n${dj.format('YYYY-MM-DD HH:mm:ss')} | ${u}\n\n${currentDialogMessage.content}`;
        setValue(r);
        //setValue("\n" + answer.body);
      }
    } else if (isDownKey(key) || key.name === 'j') {
      let answerExists: boolean = false; 
      if (currentDialogMessage.id === 0) {
        answerExists = await currentDialogMessage.populate();
      } else {
        answerExists = await getNextMessage('down');
      }

      if (answerExists) {
        currentId = currentDialogMessage.id;
        rl.write(null, { ctrl: true, name: 'u' }); // clear line
        rl.write(currentDialogMessage.content);
        const u = currentDialogMessage.user_id === 0 ? 'You:' : 'gpt-3.5-turbo:';
        const dj = dayjs.unix(currentDialogMessage.created_at);
        r = `\n${dj.format('YYYY-MM-DD HH:mm:ss')} | ${u}\n\n${currentDialogMessage.content}`;
        setValue(r);
        //setValue("\n" + answer.body);
      }
    } else if (key.name === 'c') { // Copy
      const answer = value || defaultValue || '';
      setStatus('loading');
      const isValid = await config.validate(answer);
      if (isValid === true) {
        clipboard.writeSync(answer);
        global.copied = true;

        setValue(answer);
        setStatus('done');
        done(answer);
      } else {
        setValue('');
        setError(isValid || 'You must provide a valid value');
        setStatus('pending');
      }
    } else {
      //setValue(rl.line);
      //setError(undefined);
    }
  });

  const message = chalk.bold(config.message);
  let formattedValue = value;
  if (typeof config.transformer === 'function') {
    formattedValue = config.transformer(value, { isFinal: status === 'done' });
  }
  if (status === 'done') {
    formattedValue = chalk.cyan(formattedValue);
  }

  let defaultStr = '';
  if (defaultValue && status !== 'done' && !value) {
    defaultStr = chalk.dim(` (${defaultValue})`);
  }

  let error = '';
  if (errorMsg) {
    error = chalk.red(`> ${errorMsg}`);
  }

  if (message.length > 0 || defaultStr.length > 0) {
    //return [`${prefix} ${message}${defaultStr} ${formattedValue}`, error];
    return [`${message}${defaultStr} ${formattedValue}`, error];
  } else {
    //return [`${prefix} ${formattedValue}`, error];
    return [`${formattedValue}`, error];
  }
});
