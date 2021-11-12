import { IsValidSteamId } from "#api/shared/steamid.validator";
import NotificationLevel from "#utils/notificationLevel";
import { Optional } from "@nestjs/common";
import { IsNumber, IsString, Max, Min } from "class-validator";

export class UpdateProfileDto {
  @IsValidSteamId()
  @Optional()
  @IsString()
  steamId!: string;

  @Min(NotificationLevel.NONE)
  @Max(NotificationLevel.ALL)
  @IsNumber()
  notificationsLevel!: number;
}
