import { IsValidSteamId } from "#api/shared/steamid.validator";
import NotificationLevel from "#utils/notificationLevel";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsValidSteamId()
  @IsString()
  steamId!: string;

  @IsOptional()
  @IsNumber()
  @Min(NotificationLevel.NONE)
  @Max(NotificationLevel.ALL)
  notificationsLevel!: number;
}
