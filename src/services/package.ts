import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export interface PackageJson {
  name: string;
  version: string;
}

export const packageInfo = (): PackageJson => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const file = path.join(__dirname, "..", "..", "package.json");
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const packageIson = {
    name: json.name,
    version: json.version
  };
  return packageIson;
}
