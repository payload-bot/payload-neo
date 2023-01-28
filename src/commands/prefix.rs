use crate::{Context, Error};
use poise::serenity_prelude as serenity;

#[poise::command(slash_command)]
pub async fn prefix(ctx: Context<'_>) -> Result<(), Error> {
    todo!();
    Ok(())
}
