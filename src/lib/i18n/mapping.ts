import { Identifiers } from "@sapphire/framework";
import { LanguageKeys } from "./all";

export function mapIdentifier(identifier: string): string {
  switch (identifier) {
    case Identifiers.CommandDisabled:
      return LanguageKeys.Preconditions.DisabledGlobal;
    case Identifiers.PreconditionCooldown:
      return LanguageKeys.Preconditions.Cooldown;
    case Identifiers.PreconditionDMOnly:
      return LanguageKeys.Preconditions.DmOnly;
    case Identifiers.PreconditionGuildNewsOnly:
      return LanguageKeys.Preconditions.GuildNewsOnly;
    case Identifiers.PreconditionGuildNewsThreadOnly:
      return LanguageKeys.Preconditions.GuildNewsThreadOnly;
    case Identifiers.PreconditionGuildOnly:
      return LanguageKeys.Preconditions.GuildOnly;
    case Identifiers.PreconditionGuildPrivateThreadOnly:
      return LanguageKeys.Preconditions.GuildPrivateThreadOnly;
    case Identifiers.PreconditionGuildPublicThreadOnly:
      return LanguageKeys.Preconditions.GuildPublicThreadOnly;
    case Identifiers.PreconditionGuildTextOnly:
      return LanguageKeys.Preconditions.GuildTextOnly;
    case Identifiers.PreconditionNSFW:
      return LanguageKeys.Preconditions.Nsfw;
    case Identifiers.PreconditionClientPermissions:
      return LanguageKeys.Preconditions.ClientPermissions;
    case Identifiers.PreconditionUserPermissions:
      return LanguageKeys.Preconditions.UserPermissions;
    case Identifiers.PreconditionThreadOnly:
      return LanguageKeys.Preconditions.ThreadOnly;
    default:
      return identifier;
  }
}
