import { LanguageKeys } from "#lib/i18n/all/index";
import { user, webhook } from "#root/drizzle/schema";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { fetchT } from "@sapphire/plugin-i18next";
import { generate } from "generate-password";
import { codeBlock, type ButtonInteraction } from "discord.js";

export class ButtonHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "create-webhook-for-user") {
      return this.none();
    }

    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    const t = await fetchT(interaction);

    const secret = generate({ numbers: true, length: 24 });

    const [createdWebhook] = await this.container.database
      .insert(webhook)
      .values({
        id: interaction.user.id,
        type: "users",
        value: secret,
      })
      .returning();

    await this.container.database
      .insert(user)
      .values({
        id: interaction.user.id,
        webhookId: createdWebhook.id,
      })
      .onConflictDoUpdate({
        set: {
          webhookId: createdWebhook.id,
        },
        target: user.id,
      });

    await interaction.reply({
      content: t(LanguageKeys.Commands.Webhook.CreatedWebhook, { secret: codeBlock(createdWebhook.value) }),
      ephemeral: true,
    });
  }
}
