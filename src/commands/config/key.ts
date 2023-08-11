import { Command } from '@oclif/core'
import inquirer from 'inquirer';
import { getConfig, setConfigWithOthers } from '../../services/config.js'

export default class ConfigKey extends Command {
  static description = 'Configure your key.'

  static flags = {}

  static args = {}

  async run(): Promise<void> {
    const [key, others] = getConfig('KEY');
    if (key !== '') {
      console.log('The current key is:', key);
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Enter your new key:',
      }
    ]).then((answers) => {
      if (answers.key.length > 10) {
        setConfigWithOthers('KEY', answers.key, others);
      } else {
        console.log('Error!');
      }
    });
  }
}
