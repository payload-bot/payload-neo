import config from "#root/config";
import type { GuildFun } from "../models/guild.model";

export class GuildResponseDto {
  public id: string;
  public icon: string;

  public botName: string;

  public enableSnipeForEveryone: boolean;
  public language: string;
  public prefix: string;
  public fun: GuildFun | null;

  constructor(options: GuildResponseOptions) {
    this.id = options.id;
    this.icon = options.icon;

    this.botName = options.botName;

    this.enableSnipeForEveryone = options.enableSnipeForEveryone ?? false;
    this.language = options.language ?? "en-US";
    this.prefix = options.prefix ?? config.PREFIX;
    this.fun = options.fun;
  }
}

export interface GuildResponseOptions {
  id: string;
  icon: string;

  botName: string;

  enableSnipeForEveryone: boolean | null;
  language: string | null;
  prefix: string | null;
  fun: GuildFun | null;
}
