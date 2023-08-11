import {Command} from '@oclif/core'
import { createTopic } from '../../services/messages.js';

export default class World extends Command {
  static description = 'New topic'

  static flags = {}

  static args = {}

  async run(): Promise<void> {
    await createTopic();
  }
}
