import {Args, Command, Flags} from '@oclif/core'

export default class Topic extends Command {
  static description = 'Topic'

  static flags = {}

  static args = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Topic)
  }
}
