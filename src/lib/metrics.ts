import client from "@prometheus-io/client";
import { container } from "@sapphire/pieces";

export const commandCounter = new client.Counter({
  name: "command_run_hit_total",
  help: "The number of commands ran",
  labelNames: ["command", "auto"] as const,
});

export const renderCounter = new client.Counter({
  name: "render_hit_total",
  help: "Number of logs auto response renders",
  labelNames: ["source"] as const,
});

export const renderErrors = new client.Counter({
  name: "render_error_hit_total",
  help: "Number of logs rendering renders",
  labelNames: ["cause"] as const,
});

export const autoCompletes = new client.Counter({
  name: "autocomplete_hit_total",
  help: "The number of autocompletes ran",
  labelNames: ["command"] as const,
});

export const messageProcessed = new client.Counter({
  name: "message_processed_hit_total",
  help: "The number of messages processed",
});

export const messageIgnored = new client.Counter({
  name: "message_ignored_hit_total",
  help: "The number of messages ignored",
  labelNames: ["reason"] as const,
});

export const webhookEndpoint = new client.Counter({
  name: "webhook_hit_total",
  help: "The number of webhooks that got called",
  labelNames: ["version"] as const,
});

new client.Gauge({
  name: "guild_active",
  help: "The current number of guilds being served",
  collect() {
    this.set(container.client.guilds.cache.size);
  },
});

new client.Gauge({
  name: "user_active",
  help: "The current number of users being served",
  collect() {
    this.set(container.client.users.cache.size);
  },
});
