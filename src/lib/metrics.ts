import client from "@prometheus-io/client";
import { container } from "@sapphire/pieces";

export const commandCounter = new client.Counter({
  name: "command_run_hit_total",
  help: "The number of commands ran",
  labelNames: ["command", "auto"],
});

export const renderCounter = new client.Counter({
  name: "render_hit_total",
  help: "Number of logs auto response renders",
  labelNames: ["source"],
});

export const renderErrors = new client.Counter({
  name: "render_error_hit_total",
  help: "Number of logs rendering renders",
  labelNames: ["cause"],
});

export const autoCompletes = new client.Counter({
  name: "autocomplete_hit_total",
  help: "The number of autocompletes ran",
  labelNames: ["command"],
});

new client.Gauge({
  name: "guild_active",
  help: "The current number of guilds being served",
  collect() {
    this.set(container.client.guilds.cache.size);
  },
});

new client.Gauge({
  name: "users_active",
  help: "The current number of users being served",
  collect() {
    this.set(container.client.users.cache.size);
  },
});
