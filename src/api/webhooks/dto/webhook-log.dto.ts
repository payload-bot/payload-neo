import { IsNumberString } from "class-validator";

export class WebhookLogDto {
  @IsNumberString()
  logsId!: string;
}
