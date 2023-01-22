mod commands;
use commands::*;

use sqlx::{Pool, Postgres};
use tracing::{error, instrument};

use poise::serenity_prelude as serenity;

type Error = Box<dyn std::error::Error + Send + Sync>;
type Context<'a> = poise::Context<'a, Data, Error>;
type AppContext<'a> = poise::ApplicationContext<'a, Data, Error>;

// User data, which is stored and accessible in all command invocations
pub struct Data {
    http_client: reqwest::Client,
    database: Pool<Postgres>,
}

#[derive(sqlx::FromRow)]
struct GuildPrefix {
    prefix: String,
}

#[instrument]
#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect(".env file not found");

    tracing_subscriber::fmt::init();

    let pool_config = sqlx::postgres::PgPoolOptions::new();

    let pool = pool_config
        .connect(option_env!("DATABASE_URL").unwrap())
        .await
        .unwrap()
        .clone();

    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![register::register(), settings::settings()],
            prefix_options: poise::PrefixFrameworkOptions {
                prefix: Some("pls ".into()),

                dynamic_prefix: Some(|ctx| {
                    Box::pin(async move {
                        Ok(Some(match ctx.guild_id {
                            Some(guild_id) => {
                                let prefix = sqlx::query_as::<_, GuildPrefix>(
                                    r#"SELECT prefix FROM guilds WHERE id = $1"#,
                                )
                                .bind(guild_id.to_string())
                                .fetch_one(&ctx.data.database)
                                .await;

                                prefix
                                    .and_then(|p| Ok(p.prefix))
                                    .unwrap_or(String::from("pls "))
                            }

                            None => String::from("pls "),
                        }))
                    })
                }),

                edit_tracker: Some(poise::EditTracker::for_timespan(
                    std::time::Duration::from_secs(3600),
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
                poise::builtins::register_in_guild(ctx, &framework.options().commands, serenity::GuildId(428020381413277706)).await?;

                Ok(Data {
                    http_client: reqwest::Client::new(),
                    database: pool,
                })
            })
        });

    framework.run().await.unwrap();
}
