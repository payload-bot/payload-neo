import { Exclude } from "class-transformer";
import type { GuildFeature } from "discord-api-types/payloads/v9";

export class ConvertedGuild {
  isPayloadIn: boolean = false;
  id!: string;
  name!: string;
  owner: boolean = false;
  features: GuildFeature[] = [];
  permissions!: string;
  icon!: string | null;

  @Exclude({ toPlainOnly: true })
  canManage!: boolean;

  constructor(options: Partial<ConvertedGuild>) {
    Object.assign(this, options);
  }
}
