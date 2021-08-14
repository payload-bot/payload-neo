import { boolean, object, string } from "joi";

const LANGUAGES = {
	ENGLISH: "en-US",
	SPANISH: "es-ES",
	FINNISH: "fi-FI",
	GERMAN: "de-DE",
	POLISH: "pl-PL"
};

const guildSettingsSchema = object({
	botName: string().min(1).max(100),
	prefix: string().min(1).max(75),
	enableSnipeForEveryone: boolean(),
	language: string().valid(...Object.values(LANGUAGES))
});

export default guildSettingsSchema;
