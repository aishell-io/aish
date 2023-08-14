import { Command } from '@oclif/core'
import { createTopic } from '../../services/messages.js';

export default class TopicNew extends Command {
  static description = 'New topic'

  async run(): Promise<void> {
    // todo: if the current topic is empty, then don't create a new topic.
    await createTopic();
  }
}
