import client from "@prometheus-io/client";

export const registry = new client.Registry();

export const commandCounter = new client.Counter({
  name: "command_ran",
  help: "The number of commands ran",
  labelNames: ["command"],
});

registry.registerMetric(commandCounter);
