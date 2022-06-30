import { readFile } from "fs/promises";
import { resolve } from "path";

export async function getChangelog(version: string) {
  if (!version.match(/\d+\.\d+.\d+/)) return null;
  try {
    const changelogText = await readFile(resolve(__dirname, "../../changelog.md"), {
      encoding: "utf8",
    });

    const availableVersions = (changelogText.match(/### \d+\.\d+\.\d+/g) as RegExpMatchArray).map(str =>
      str.replace("### ", "")
    );

    if (!availableVersions.includes(version)) return null;

    const versionRegExp = new RegExp(`### ${version.replace(/\./g, "\\.")}([^\#+])+`);

    const changelog = (changelogText.match(versionRegExp) as RegExpMatchArray)[0];

    return changelog;
  } catch (er) {
    return null;
  }
}
