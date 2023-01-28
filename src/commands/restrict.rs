use crate::{Context, Error};
use poise::serenity_prelude as serenity;

#[poise::command(slash_command)]
pub async fn restrict(ctx: Context<'_>) -> Result<(), Error> {
    todo!();
    Ok(())
}
