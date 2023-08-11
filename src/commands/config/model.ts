import { Command } from '@oclif/core'
import inquirer from 'inquirer';
import { getConfig, setConfigWithOthers } from '../../services/config.js'

export default class ConfigModel extends Command {
  static description = 'Configure the default model.'

  static flags = {}

  static args = {}

  async run(): Promise<void> {
    const [defaultModel, others] = getConfig('MODEL');
    if (defaultModel !== '') {
      console.log('The current model is:', defaultModel);
    }

    inquirer.prompt([
      {
        type: 'input',
        name: 'modelname',
        message: 'Enter the default model name:',
      }
    ]).then((answers) => {
      if (answers.modelname.length > 1) {
        setConfigWithOthers('MODEL', answers.modelname, others);
      } else {
        console.log('Error! Failed to configure the default model.');
      }
    });
  }
}
