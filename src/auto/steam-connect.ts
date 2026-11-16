import { type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { LanguageKeys } from "#lib/i18n/all";
import SteamConnectBase from "#lib/steam-connect-base.ts";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Connect.LinkDescription,
  regex: /^connect (?<ip>(?:\w+:\/\/)?[^:;\s]+)(?::(?<port>\d+))?(?=;|$)(?:; password (?<password>.+))?/,
})
export default class UserAutoCommand extends SteamConnectBase {
}
