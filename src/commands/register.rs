use crate::{Context, Error};
use poise::serenity_prelude as serenity;

#[poise::command(prefix_command, check = "check")]
pub async fn register(ctx: Context<'_>) -> Result<(), Error> {
    poise::builtins::register_application_commands_buttons(ctx).await?;
    Ok(())
}

async fn check(ctx: Context<'_>) -> Result<bool, Error> {
    let user = ctx.author();

    if user.id != serenity::UserId(176457969465163776) {
        return Ok(false);
    }

    Ok(true)
}
