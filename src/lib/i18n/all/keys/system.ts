import { T } from "#lib/types";

export const HelpTitles = T<{
  description: string;
  aliases: string;
  usages: string;
  moreDetails: string;
}>("system:helpTitles");
