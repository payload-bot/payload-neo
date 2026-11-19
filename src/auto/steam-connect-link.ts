import { AutoCommand } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { LanguageKeys } from "#lib/i18n/all";
import SteamConnectBase from "#lib/steam-connect-base.ts";

export default class UserAutoCommand extends SteamConnectBase {
  public constructor(context: AutoCommand.LoaderContext, options: AutoCommand.Options) {
    super(context, {
      ...options,
      description: LanguageKeys.Auto.Connect.Description,
      regex: /^steam:\/\/connect\/(?<ip>[^:\s]+)(?::(?<port>\d+))?(?=\/|$)(?:\/(?<password>.+))?/,
    });
  }
}
