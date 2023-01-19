import "#utils/setup";
import { container } from "@sapphire/framework";
import { PayloadClient } from "#lib/PayloadClient";
import { asFunction, createContainer, InjectionMode, Lifetime } from "awilix";
import type { Scope } from "#lib/dependencyInjection/scope";

const client = new PayloadClient();

const scope = createContainer<Scope>({
  injectionMode: InjectionMode.CLASSIC,
});

container.scope = scope;

scope.register(
  "scope",
  asFunction(() => scope)
);

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
