import {Args, Command, Flags} from '@oclif/core'

export default class Config extends Command {
  static description = 'Configuration'

  static flags = {}

  static args = {}

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Config)
  }
}
