use crate::{Context, Error};
use poise::serenity_prelude as serenity;

#[poise::command(prefix_command)]
pub async fn bruh(
    ctx: Context<'_>,
    #[description = "User to mention"] user: Option<serenity::User>,
) -> Result<(), Error> {
    if let Some(user) = user {
        ctx.send(|m| m.content(format!("bruh, {}", user.tag())))
            .await?;
    } else {
        ctx.send(|m| m.content("bruh")).await?;
    }

    Ok(())
}
