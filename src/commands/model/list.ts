import { Command, Flags } from '@oclif/core'
import { getModels } from '../../services/chatgpt-api.js';
import inquirer from 'inquirer';

export default class ModelList extends Command {
  static description = 'Models'

  static flags = {
    model: Flags.string({char: 'm', description: 'Specify the model name.', required: false}),
  }

  static args = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ModelList)

    const key = process.env.KEY;
    if (key) {
      if (flags.model) {
        await getModels(key, flags.model);
      } else {
        await getModels(key);
      }
    } else {
      console.log('Error! No key found.');
    }
  }
}
