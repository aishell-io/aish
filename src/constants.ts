import * as os from 'os'
import * as path from 'path'

// $HOME/.aishell/
export const HOME_DIR = path.join(os.homedir(), '.aish')

// DB
export const DB_SQLite3 = path.join(HOME_DIR, 'db.sqlite')

// config
export const CONFIG_FILE = path.join(HOME_DIR, 'config')

// Models
// Config is overwriting this if it exists:
// MODEL=gpt-3.5-turbo
export const MODELS = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0301',
  'gpt-4',
];

export const MAX_MESSAGES = 3000; // Bytes

export const API_OPENAI_MODEL = 'https://api.openai.com/v1/models';

export const DEFAULT_API_URL = 'https://packdir.com/a4';

export const END_OF_CONVERSATION = [
  'bye',
  'goodbye',
  'quit',
  'q',
  'exit',
  'see you',
  'see you later',
  'have a good day',
  'have a good night',
  'end',
  'finish',
  'stop',
  'done',
]
