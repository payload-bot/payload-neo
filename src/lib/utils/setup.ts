import "reflect-metadata";

import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-hmr/register";
import { container } from "@sapphire/framework";

import { setup } from "@skyra/env-utilities";
import { createContainer, InjectionMode, Lifetime } from "awilix";

setup(new URL("../../../.env", import.meta.url));

const scope = createContainer({
  injectionMode: InjectionMode.CLASSIC,
}).loadModules(["../providers/**/*.js"], {
  esModules: true,
  formatName: "camelCase",
  resolverOptions: { lifetime: Lifetime.SINGLETON },
});

container.scope = await scope;
