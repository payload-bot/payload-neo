import { copyFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const srcPath = resolve(__dirname, "../src/assets");
const dirPath = resolve(__dirname, "../dist/assets");

const assetsDir = readdirSync(srcPath);

if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
}

assetsDir.forEach(file => {
    copyFileSync(srcPath + "/" + file, dirPath + "/" + file);
});