import * as fs from "fs";
import * as os from "os";
import { CONFIG_FILE } from "../constants.js";

/**
 * Get the value of an environment variable and other lines in config file.
 * @param key The key of the environment variable.
 * @returns The value of the environment variable, and other lines.
 */
export const getConfig = (keyName: string): any => {
  let envVars: Array<string> = [];
  if (fs.existsSync(CONFIG_FILE)) {
    envVars = fs.readFileSync(CONFIG_FILE, "utf8").split(os.EOL) as any;
  }

  let others: Array<string> = [];
  let keyValue = "";
  let found = false;
  for (let i = 0; i < envVars.length; i++) {
    const line = envVars[i];
    // Split the line into key/value pairs
    const [envKey, envValue] = line.split("=");
    // If the key matches the 'KEY', return the value
    if (envKey === keyName) {
      if (!found) {
        keyValue = envValue;
        found = true;
      } // else to discard the duplicate key
    } else {
      const configLine = line.trim();
      if (configLine.length > 0) {
        others.push(configLine);
      }
    }
  }
  return [keyValue, others];
}

export const setConfigWithOthers = (key: string, value: string, others: Array<string>) => {
  if (fs.existsSync(CONFIG_FILE)) {
    // Delete the file
    fs.unlinkSync(CONFIG_FILE);
  }

  // Config content
  let keyConfig = `${key}=${value}${os.EOL}${os.EOL}`;
  const othersString = others.join(os.EOL);

  // Create the file
  fs.writeFileSync(CONFIG_FILE, keyConfig + othersString);
  console.log('Saved!');
}
