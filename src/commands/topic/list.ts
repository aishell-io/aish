import { Command } from '@oclif/core'
import { listTopics } from '../../services/messages.js';

export default class TopicList extends Command {
  static description = 'List topics.'

  static aliases = ['topic']

  async run(): Promise<void> {
    const topics = await listTopics();
    if (topics.length > 0) {
      for (let i=0; i<topics.length; i++) {
        console.log(topics[i].id, ':', topics[i].title);
      }
    } else {
      console.log('No topic found.');
    }
  }
}
