import { Command } from '@oclif/core'
import { listTopics } from '../../services/messages.js';

export default class TopicList extends Command {
  static description = 'List topics.'

  static aliases = ['topic']

  topic_count = 0;
  max_topic_count = 5; // By default, list 5 topics.

  current_topic_id = 0;
  message_count = 0;
  bodys = [] as string[];
  ignore = false;

  init_the_current_topic(topic_id: number) {
    this.current_topic_id = topic_id;
    this.message_count = 0;
    this.bodys = [];
    this.ignore = false;
  }

  output_topic() {
    if (this.bodys.length > 0) {
      console.log(`---------- ${this.current_topic_id} -----------\n\n`);
      for (let i=0; i<this.bodys.length; i++) {
        console.log(this.bodys[i], '\n\n');
      }

      // count
      this.topic_count++;
    }
    //this.init_the_current_topic(new_topic_id);
  }

  async run(): Promise<void> {
    const topics = await listTopics();
    if (topics.length > 0) {
      this.init_the_current_topic(topics[0].tid);

      for (let i=0; i<topics.length; i++) {
        // Reach the max topic count.
        if (this.topic_count >= this.max_topic_count) {
          break;
        }

        if (topics[i].tid === this.current_topic_id) {
          if (this.ignore) {
            continue;
          }
        } else {
          if (!this.ignore) {
            this.output_topic();
          }
          this.init_the_current_topic(topics[i].tid);
        }

        if (this.message_count > 1) {
          this.output_topic();
          this.ignore = true;
        } else if (topics[i].body == null) {
          continue;
        } else {
          this.bodys.push(topics[i].body);
          this.message_count++;
        }
      }
    } else {
      console.log('No topic found.');
    }
  }
}
