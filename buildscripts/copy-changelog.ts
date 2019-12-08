import { copyFileSync } from "fs";
import { resolve } from "path";

const srcPath = resolve(__dirname, "../changelog.md");
const dirPath = resolve(__dirname, "../dist/changelog.md");

copyFileSync(srcPath, dirPath);