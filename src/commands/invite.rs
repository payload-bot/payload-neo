use crate::{Context, Error};

const INVITE_URL: &'static str =  "https://discord.com/oauth2/authorize?redirect_uri=https%3A%2F%2Fapi.payload.tf%2Fapi%2Fauth%2Fdiscord%2Fcallback&client_id=644333502870978564&permissions=67496000&scope=bot%20applications.commands";

#[poise::command(prefix_command)]
pub async fn invite(ctx: Context<'_>) -> Result<(), Error> {
    ctx.send(|m| m.content(INVITE_URL)).await?;

    Ok(())
}
