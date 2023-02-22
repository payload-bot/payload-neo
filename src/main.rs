mod commands;
use commands::*;

use sqlx::{Pool, MySql};
use tracing::{error, instrument};

use poise::serenity_prelude as serenity;

type Error = Box<dyn std::error::Error + Send + Sync>;
type Context<'a> = poise::Context<'a, Data, Error>;
type AppContext<'a> = poise::ApplicationContext<'a, Data, Error>;

// User data, which is stored and accessible in all command invocations
pub struct Data {
    http_client: reqwest::Client,
    database: Pool<MySql>,
}

#[instrument]
#[tokio::main]
async fn main() {
    #[cfg(debug)]
    {
        dotenvy::dotenv().unwrap();
    }

    tracing_subscriber::fmt::init();

    let pool_config = sqlx::mysql::MySqlPoolOptions::new();

    let pool = pool_config
        .connect(option_env!("DATABASE_URL").unwrap())
        .await
        .unwrap();

    sqlx::migrate!("./migrations").run(&pool).await.unwrap();

    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![
                register::register(),
                settings::settings(),
                bruh::bruh(),
                invite::invite(),
                // come back to this soon
                // playercheck::playercheck(),
                pushcart::pushcart(),
                pushcart::leaderboard(),
                restrict::restrict(),
                unrestrict::unrestrict(),
            ],
            prefix_options: poise::PrefixFrameworkOptions {
                prefix: Some("pls ".into()),

                // dynamic_prefix: Some(|ctx| {
                //     Box::pin(async move {
                //         Ok(Some(match ctx.guild_id {
                //             Some(guild_id) => {
                //                 let guild_data = sqlx::query!(
                //                     "SELECT prefix FROM guilds WHERE id = ?",
                //                     guild_id.to_string()
                //                 )
                //                 .fetch_optional(&ctx.data.database)
                //                 .await?;

                //                 if let Some(guild_data) = guild_data {
                //                     guild_data.prefix
                //                 } else {
                //                     "pls ".into()
                //                 }
                //             }

                //             None => String::from("pls "),
                //         }))
                //     })
                // }),

                edit_tracker: Some(poise::EditTracker::for_timespan(
                    std::time::Duration::from_secs(120),
                )),

                case_insensitive_commands: true,

                ..Default::default()
            },
            on_error: |err| {
                Box::pin(async move {
                    match err {
                        poise::FrameworkError::Command { ctx, .. } => {
                            error!(
                                "In on_error: {:?}",
                                ctx.invocation_data::<&str>().await.as_deref()
                            );
                        }
                        err => {
                            if let Err(e) = poise::builtins::on_error(err).await {
                                error!("Fatal error while sending error message: {}", e);
                            }
                        }
                    }
                })
            },
            ..Default::default()
        })
        .token(std::env::var("DISCORD_TOKEN").expect("expected DISCORD_TOKEN"))
        .intents(
            serenity::GatewayIntents::non_privileged() | serenity::GatewayIntents::MESSAGE_CONTENT,
        )
        .setup(move |ctx, _ready, framework| {
            Box::pin(async move {
                poise::builtins::register_in_guild(
                    ctx,
                    &framework.options().commands,
                    serenity::GuildId(428020381413277706),
                )
                .await?;

                Ok(Data {
                    http_client: reqwest::Client::new(),
                    database: pool,
                })
            })
        });

    framework.run().await.unwrap();
}
