import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk';
import readPipe from '../services/read-stdin-stream.js'
import { talkToModel } from '../services/chatgpt-api.js';
//import { createTopic, getLastTopicId, retrieveMessagesByTopicId } from '../services/messages.js';

export default class Run extends Command {
  static description = 'Talk to the model.'

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
    message: Args.string({description: 'Prompt'}),
  }

  aiwords = (words: string): string => {
    let colored = chalk.greenBright(words);
    return colored;
  }

  public async run(): Promise<void> {
    try {
      const {args, flags} = await this.parse(Run)

      const prompt = args.message;
      if (prompt === undefined) {
        const stdioPrompt = await readPipe();
        if (stdioPrompt && stdioPrompt.length > 1) {
          await talkToModel(stdioPrompt);
        }
      } else if (prompt.length < 2) {
        this.log('Prompt is too short. Ignored it.')
      } else {
        await talkToModel(prompt);
      }
    } catch (err: any) {
      // 404
      console.log('Error 1061! Cannot access to the endpoint.');
      console.log('err: ', err.response.data)
    }
  }
}
