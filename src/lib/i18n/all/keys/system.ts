import { T } from "#lib/types";

export const HelpTitles = T<{
  aliases: string;
  usages: string;
  extendedHelp: string;
}>("system:helpTitles");
