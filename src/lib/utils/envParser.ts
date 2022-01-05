import { isNullishOrEmpty } from "@sapphire/utilities";

type EnvKeys = "OWNERS" | "REDIS_URL" | "REDIS_ENABLED";

export function envParseArray(key: EnvKeys, defaultValue?: string[]): string[] {
  const value = process.env[key];
  if (isNullishOrEmpty(value)) {
    if (defaultValue === undefined)
      throw new Error(
        `[ENV] ${key} - The key must be an array, but is empty or undefined.`
      );
    return defaultValue;
  }

  return value.split(" ");
}

export function envParseString(key: EnvKeys, defaultValue?: string): string {
  const value = process.env[key];

  if (isNullishOrEmpty(value)) {
    if (defaultValue === undefined)
      throw new Error(
        `[ENV] ${key} - The key must be a string, but is empty or undefined.`
      );
    return defaultValue;
  }

  return value;
}

export function envParseBoolean(key: EnvKeys, defaultValue?: boolean): boolean {
  const value = process.env[key];

  if (!Boolean(value)) {
    if (defaultValue === undefined)
      throw new Error(`[ENV] ${key} - The key must be a boolean.`);
    return defaultValue;
  }

  return Boolean(value);
}
