import { container } from "@sapphire/framework";
import { asClass, RESOLVER } from "awilix";

export function Export(options: { name: string }): ClassDecorator {
  return function (target: any) {
    container.logger.trace(`Registering ${options.name} to scope [${target.name}]`);
    target[RESOLVER] = {}
    container.scope.register(options.name, asClass(target));
  };
}
