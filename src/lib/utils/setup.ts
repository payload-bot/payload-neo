import "reflect-metadata";

import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-i18next/register";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-hmr/register";

import { setup } from "@skyra/env-utilities";

setup(new URL("../../../.env", import.meta.url));
