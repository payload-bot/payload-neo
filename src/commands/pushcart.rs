use crate::{Context, Error};
use poise::serenity_prelude::Colour;

/// Pushes the cart
#[poise::command(slash_command, guild_only, rename = "push")]
pub async fn pushcart(ctx: Context<'_>) -> Result<(), Error> {
    let user_id = ctx.author().id.to_string();
    let guild_id = ctx.guild_id().unwrap().to_string();

    let pushed = 5;

    if let Err(why) = sqlx::query!(
        r#"INSERT INTO pushcart (userId, guildId, pushed) VALUES (?, ?, ?)"#,
        &user_id,
        &guild_id,
        &pushed
    )
    .execute(&ctx.data().database)
    .await
    {
        tracing::error!("failed to pushcart for user {}\n{why}", &user_id);

        ctx.send(|m| {
            m.embed(|e| {
                e.color(Colour::RED)
                    .title("Failed")
                    .description("Failed to push the cart")
            })
        })
        .await?;

        return Ok(());
    }

    let total_points = sqlx::query!(
        r#"SELECT SUM(pushed) as total FROM pushcart WHERE userId = ? GROUP BY userId"#,
        &user_id
    )
    .fetch_one(&ctx.data().database)
    .await;

    ctx.say(format!(
        "<:payload:656955124098269186> Pushed the cart forward {} units ({} total)",
        &pushed.to_string(),
        total_points.unwrap().total.unwrap_or(0.into()).to_string()
    ))
    .await?;

    Ok(())
}
