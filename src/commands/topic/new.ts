import { Command } from '@oclif/core'
import { createTopic } from '../../services/messages.js';

export default class TopicNew extends Command {
  static description = 'New topic'

  async run(): Promise<void> {
    await createTopic();
  }
}
