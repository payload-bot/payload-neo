import { readFileSync } from "fs";
import { resolve } from "path";

export function getChangelog(version: string) {
    if (!version.match(/\d+\.\d+.\d+/)) return false;

    let changelogText = readFileSync(resolve(__dirname, "../changelog.md"), { encoding: "utf8" });

    let availableVersions = (changelogText.match(/### \d+\.\d+\.\d+/g) as RegExpMatchArray).map(str => str.replace("### ", ""));

    if (!availableVersions.includes(version)) return false;

    let versionRegExp = new RegExp(`### ${version.replace(/\./g, "\\.")}([^\#+])+`);

    let changelog = (changelogText.match(versionRegExp) as RegExpMatchArray)[0];

    return changelog;
}