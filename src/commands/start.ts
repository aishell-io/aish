import { Args, Command, Flags } from '@oclif/core'
import createInputPrompt from "../inquirer_prompts/input.js";
import createNormalInputPrompt from "../inquirer_prompts/inputNormal.js";
import chalk from 'chalk';
import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
  usePrefix,
  isUpKey,
  isDownKey,
  isBackspaceKey,
  AsyncPromptConfig,
} from '@inquirer/core';
import type {} from '@inquirer/type';
//import readline from 'readline'
//import axios from 'axios'

import { intro, outro, text, spinner } from '@clack/prompts';

import { DB_SQLite3, END_OF_CONVERSATION, MAX_MESSAGES } from '../constants.js'
import { DialogTopic, DialogMessage, countMessages, retrieveMessages } from '../services/messages.js';
import { packageInfo } from '../services/package.js';

import { createTopic } from '../services/messages.js';
import clipboard from 'clipboardy';

/**
 * 
 * @param prompt 
 * @param countEnter 
 * @returns 
 */
function getPrompt(prompt = '', countEnter = 0): Promise<string> {
  return new Promise( async (resolve, reject) => {

    type InputConfig = AsyncPromptConfig & {
      default?: string;
      transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
    };
    
    const input = createPrompt<string, InputConfig>((config, done) => {
      const [status, setStatus] = useState<string>('pending');
      const [defaultValue, setDefaultValue] = useState<string | undefined>(config.default);
      const [errorMsg, setError] = useState<string | undefined>(undefined);
      const [value, setValue] = useState<string>('');
    
      const isLoading = status === 'loading';
      //const prefix = usePrefix(isLoading);
      const prefix = '>';
    
      useKeypress(async (key, rl) => {
        // Ignore keypress while our prompt is doing other processing.
        if (status !== 'pending') {
          return;
        }

        // 
        if (isEnterKey(key)) {
          countEnter++;
        } else {
          countEnter = 0;
        }
    
        if (isEnterKey(key)) {
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
        } else if (isBackspaceKey(key) && !value) {
          setDefaultValue(undefined);
        } else {
          setValue(rl.line);
          setError(undefined);
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
    
      return [`${prefix} ${message}${defaultStr} ${formattedValue}`, error];
    });

    const answers = await input({ message: '' });
    //console.log('answer: ', answers)
    const prt = answers.trim();

    if (countEnter < 3) {
      const next = await getPrompt(prompt + "\n" + prt, countEnter)
      resolve(next)
    } else {
      const isEnd = await isEndPrompt()
      if (isEnd) {
        resolve(prompt)
      } else {
        const next = await getPrompt(prompt, 0)
        resolve(prt)
      }
    }
  });
}

/**
 * Editor
 * @returns Prompt text
 */
function editorPrompt(): Promise<string> {
  return new Promise( async (resolve, reject) => {
  });
}

/**
 * Get multiple lines of input from the user.
 * @returns Prompt text
 */
function isEndPrompt(): Promise<boolean> {
  return new Promise( async (resolve, reject) => {

    const confirm = createPrompt<boolean, { message: string; default?: boolean }>(
      (config, done) => {
        const [status, setStatus] = useState('pending');
        const [value, setValue] = useState('');
        //const prefix = usePrefix();
        const prefix = '?';
  
        useKeypress((key, rl) => {
          if (isEnterKey(key)) {
            const answer = value ? /^y(es)?/i.test(value) : config.default !== false;
            setValue(answer ? 'yes' : 'no');
            setStatus('done');
            done(answer);
          } else if (isUpKey(key) && key.name !== 'k') {
            //console.log('upupupup')
            const answer = 'up herer'
            rl.write(answer);
            setValue(answer);
            //setStatus('done');
            //done(true);

          } else if (isDownKey(key)) {
          } else {
            setValue(rl.line);
          }
        });

        let formattedValue = value;
        let defaultValue = '';
        if (status === 'done') {
          formattedValue = chalk.cyan(value);
        } else {
          defaultValue = chalk.dim(config.default === false ? ' (y/N)' : ' (Y/n)');
        }
  
        //const message = chalk.bold(config.message);
        const message = chalk.dim(config.message);
        return `${prefix} ${message}${defaultValue} ${formattedValue}`;
      }
    );
  
    /**
     *  Which then can be used like this:
     */
    //const answers = await confirm({ message: 'Do you want to continue?' });
    const isEnd = await confirm({ message: 'end?' });
    console.log("answer is: ", isEnd);
    const prt = ''//answers.trim();

    resolve(isEnd)
  })
}

/**
 * Start chat.
 */
export default class Start extends Command {
  static description = 'Start chat.'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  static args = {
    file: Args.string({description: 'file to read'}),
  }

  getRange(num: number): Promise<[number, number]> {
    return new Promise( async (resolve, reject) => {
      console.log('')
      const range = await createNormalInputPrompt({
        message: `Total are ${num} messages. Enter the list range:`,
        default: `${num - 1}-${num}`,
      });

      const r = /(\d+)\D+(\d+)/
      let m = range.match(r)
      const arr = m ? m : []
      if (arr[1] && arr[2] && arr[1] <= arr[2]) {
        resolve([parseInt(arr[1]), parseInt(arr[2])])
      } else {
        resolve ([num - 1, num])
      }
    })
  }

  /**
   * Browse messages.
   * @returns
   */
  async cmdBrowse() {
    return new Promise( async (resolve, reject) => {
      console.log(`\n:: ⏪ :: Pressing ⬆️⬇️ or k j to browse, c to copy, SAPCE to show, ENTER or q to quit.`)
      let answers: string;

      while(true) {
        answers = await createInputPrompt({ message: '' });
        if (global.copied) {
          global.copied = false;
          console.log(`\n[Copied to clipboard!]`)
        }
        if (!global.browseSpaceKeypress) {
          break;
        }
      }

      resolve(answers);
      //if (num > 0) {
      //} else {
      //}
    });
  }

  async execCommand(command: string) {
    return new Promise( async (resolve, reject) => {
      let continuing = true;
      if (command === 'b') {
        await this.cmdBrowse();
        console.log("\n")
        console.log(" :: ⏩ ::\n")
      } else if (command === 'c') {
        const lastAnswer = new DialogMessage();
        await lastAnswer.populate();
        if (lastAnswer.content) {
          clipboard.writeSync(lastAnswer.content);
          console.log(`\n[Copied to clipboard!]\n`)
        }
      } else if (command === 'q') {
        continuing = false;
      }
      resolve(continuing);
    })
  }

  talkAround (topic: DialogTopic, modelUsed: string) {
    return new Promise( async (resolve, reject) => {
      const prompt = await text({
        message: 'You:',
        placeholder: '',
        initialValue: '',
        validate(value) {
          if (value.length < 1) return `Value cannot be empty!`;
        },
      }) as string;

      const words = prompt.toLowerCase().trim();
      if (words.length < 2) { // hi, ok etc are normal speech.
        const continuing = await this.execCommand(prompt.toLowerCase());
        if (continuing) {
          resolve(true);
        } else {
          const s = spinner();
          s.start(`${modelUsed}: ...`);
          topic.full = true;
          await createTopic();
          s.stop("Bye!\n");
          resolve(false);
        }
      } else {
        const s = spinner();
        s.start(`${modelUsed}: ...`);

        if (END_OF_CONVERSATION.includes(words)) {
          topic.full = true;
          await createTopic();
          s.stop("Bye!\n");
          resolve(false)
        } else {
          await topic.send(prompt);

          const out = `${modelUsed}:\n\n${topic.lastAnswer}\n`;
          s.stop(out);

          resolve(true)
        }
      }
    })
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Start)

    //this.log(`\nHello from ChatGPT-3.5-turbo!\nLet's start a chat.😊\n`)

    // Model
    let modelUsed = global.currentModelName;
    const key = process.env.KEY;
    if (!key) {
      modelUsed = 'gpt-3.5-turbo';
    }

    let topic = new DialogTopic();
    await topic.assemble();
    this.log('')
    intro(`========== Start a topic ==========`);

    while (true) {
      const continued = await this.talkAround(topic, modelUsed)
      if (!continued) break;

      // New topic
      if (topic.full) {
        topic = new DialogTopic();
        await topic.assemble();
        intro(`========== Start a topic ==========`);
      }
    }

    //if (args.file && flags.force) {
    //  this.log(`you input --force and --file: ${args.file}`)
    //}
  }
}
