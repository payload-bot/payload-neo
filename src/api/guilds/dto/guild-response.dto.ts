import config from "#root/config";

export class GuildResponseDto {
  public id!: string;
  public icon!: string | null;

  public botName!: string;

  public enableSnipeForEveryone: boolean = false;
  public language: string = "en-US";
  public prefix: string = config.PREFIX;
  public pushcartPoints: number = 0;

  constructor(options: Partial<GuildResponseDto>) {
    Object.assign(this, options);
  }
}
