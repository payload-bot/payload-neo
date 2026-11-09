import client from "@prometheus-io/client";

export const registry = new client.Registry();

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

registry.registerMetric(commandCounter);
registry.registerMetric(renderCounter);
registry.registerMetric(renderErrors);
