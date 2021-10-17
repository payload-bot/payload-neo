import { isNullishOrEmpty } from '@sapphire/utilities';

type EnvKeys = "OWNERS";

export function envParseArray(key: EnvKeys, defaultValue?: string[]): string[] {
	const value = process.env[key];
	if (isNullishOrEmpty(value)) {
		if (defaultValue === undefined) throw new Error(`[ENV] ${key} - The key must be an array, but is empty or undefined.`);
		return defaultValue;
	}

	return value.split(' ');
}