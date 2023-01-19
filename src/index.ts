import "#utils/setup";
import { container } from "@sapphire/framework";
import { PayloadClient } from "#lib/PayloadClient";
import { createContainer, InjectionMode, Lifetime } from "awilix";

const client = new PayloadClient();

const scope = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.scope = scope;

await scope.loadModules(["./dist/lib/providers/**/*.js"], {
  esModules: true,
  formatName: "camelCase",
  resolverOptions: {
    lifetime: Lifetime.SINGLETON,
  },
});

try {
  await client.login();
} catch (error) {
  container.logger.error(error);
  client.destroy();
  process.exit(1);
}
