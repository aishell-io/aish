import {Args, Command, Flags} from '@oclif/core'
import { getModels } from '../../services/chatgpt-api.js'

export default class Model extends Command {
  static description = 'Models'

  static flags = {}

  static args = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Model)

    const key = process.env.KEY;
    if (key) {
      await getModels(key);
    } else {
      console.log('Error! No key found.');
    }
  }
}
