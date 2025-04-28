import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const dotenvDirName = path.dirname(fileName);
const dotenvPath = path.join(dotenvDirName, "/.env");
export default dotenvPath;
