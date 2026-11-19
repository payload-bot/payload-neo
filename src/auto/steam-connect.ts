import { LanguageKeys } from "#lib/i18n/all";
import SteamConnectBase from "#lib/steam-connect-base.ts";
import { AutoCommand } from "#root/lib/structs/AutoResponse/AutoResponse.ts";

export default class UserAutoCommand extends SteamConnectBase {
  public constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Auto.Connect.Description,
      regex: /^connect (?<ip>(?:\w+:\/\/)?[^:;\s]+)(?::(?<port>\d+))?(?=;|$)(?:; password (?<password>.+))?/,
    });
  }
}
