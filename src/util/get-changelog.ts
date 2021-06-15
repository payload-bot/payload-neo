import { readFileSync } from "fs";
import { resolve } from "path";

export function getChangelog(version: string) {
	if (!version.match(/\d+\.\d+.\d+/)) return false;

	try {
		const changelogText = readFileSync(resolve(__dirname, "../changelog.md"), { encoding: "utf8" });

		const availableVersions = (changelogText.match(
			/### \d+\.\d+\.\d+/g
		) as RegExpMatchArray).map(str => str.replace("### ", ""));

		if (!availableVersions.includes(version)) return false;

		const versionRegExp = new RegExp(`### ${version.replace(/\./g, "\\.")}([^\#+])+`);

		const changelog = (changelogText.match(versionRegExp) as RegExpMatchArray)[0];

		return changelog;
	} catch (er) {
        return false;
	}
}
