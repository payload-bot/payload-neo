use crate::{AppContext, Error};
use poise::{serenity_prelude::Colour, Modal};

/// Manage user settings
#[poise::command(slash_command, ephemeral = true)]
pub async fn settings(ctx: AppContext<'_>) -> Result<(), Error> {
    let user_id = ctx.author().id.to_string();

    let user_data = sqlx::query!(r#"SELECT "steamId" FROM users WHERE id = $1"#, &user_id)
        .fetch_optional(&ctx.data.database)
        .await?;

    let webhook_data = sqlx::query!("SELECT value FROM webhooks WHERE id = $1", &user_id)
        .fetch_optional(&ctx.data.database)
        .await?;

    let args = SettingsModal::execute_with_defaults(
        ctx,
        SettingsModal {
            steam_id: user_data.and_then(|u| u.steamId),
            webhook_token: webhook_data.and_then(|w| Some(w.value)),
        },
    )
    .await?;

    if let Some(SettingsModal {
        steam_id,
        webhook_token: _,
    }) = args
    {
        if let Err(why) = sqlx::query!(r#"INSERT INTO users ("steamId", id) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "steamId" = $1 WHERE users.id = $2"#, steam_id, &user_id)
            .execute(&ctx.data.database)
            .await
        {
            tracing::error!("failed to update steamid for user {}\n{why}", &user_id);

            ctx.send(|m| {
                m.embed(|e| {
                    e.color(Colour::RED)
                        .title("Failed")
                        .description("Failed to update your profile")
                })
            })
            .await?;

            return Ok(());
        }

        ctx.send(|m| {
            m.embed(|e| {
                e.color(Colour::BLURPLE)
                    .title("Profile Updated")
                    .description("Your profile has been updated")
            })
        })
        .await?;
    }

    Ok(())
}

#[derive(Debug, poise::Modal)]
#[name = "Manage User Settings"]
struct SettingsModal {
    #[name = "Steam ID"]
    steam_id: Option<String>,

    #[name = "Webhook Token"]
    #[placeholder = "Read Only"]
    webhook_token: Option<String>,
}
