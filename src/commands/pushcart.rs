use crate::{Context, Error};
use poise::serenity_prelude as serenity;

#[poise::command(slash_command, rename = "push")]
pub async fn pushcart(ctx: Context<'_>) -> Result<(), Error> {
    todo!();
    Ok(())
}
