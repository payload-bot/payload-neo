import { Exclude } from "class-transformer";

export class ConvertedGuild {
  isPayloadIn: boolean = false;
  id!: string;
  name!: string;
  owner: boolean = false;
  features: string[] = [];
  permissions!: string;
  icon!: string | null;

  @Exclude({ toPlainOnly: true })
  canManage!: boolean;

  constructor(options: Partial<ConvertedGuild>) {
    Object.assign(this, options);
  }
}
