import { IsNotEmpty, IsString } from "class-validator";

export class GuildWebhookCreateDto {
  @IsString()
  @IsNotEmpty()
  channelId!: string;
}
