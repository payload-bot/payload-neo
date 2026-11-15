import { AutoCommand, type AutoCommandOptions } from "#lib/structs/AutoResponse/AutoResponse.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Message, MessageActionRowComponentBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import { LanguageKeys } from "#lib/i18n/all";
import { send } from "@sapphire/plugin-editable-commands";
import { MessageFlags } from "discord.js";
import { getSteamIdFromUrl } from "#utils/getSteamId.ts";

@ApplyOptions<AutoCommandOptions>({
  description: LanguageKeys.Auto.Logs.Description,
  regex: /http(s|):\/\/(www\.|)steamcommunity\.com\/id\/\w+/,
})
export default class SteamPreviewCommand extends AutoCommand {
  // @ts-ignore have to do this
  async messageRun(msg: Message, args: AutoCommand.Args, { matched }: AutoCommand.Context) {
    console.log(matched);
    const steamId = await getSteamIdFromUrl(matched);

    const components = [
      new ContainerBuilder()
        .addSectionComponents(
          new SectionBuilder()
            .setThumbnailAccessory(
              new ThumbnailBuilder()
                .setURL("https://avatars.fastly.steamstatic.com"),
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("# name"),
              new TextDisplayBuilder().setContent(`\`\`\`\n${steamId?.get64()}\`\`\``),
              new TextDisplayBuilder().setContent(`\`\`\`${steamId?.get3()}\`\`\``),
            ),
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addActionRowComponents(
          new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("logs.tf")
                .setURL(`https://logs.tf/profile/${steamId}`),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("rgl.gg")
                .setURL(`https://rgl.gg/Public/PlayerProfile?p=${steamId}`),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("etf2l.org")
                .setURL(`https://etf2l.org/search/${steamId}`),
            ),
        ),
    ];

    await send(msg, { components, flags: MessageFlags.IsComponentsV2 });
  }
}
