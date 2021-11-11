import NotificationLevel from "#utils/notificationLevel";
import { Optional } from "@nestjs/common";
import { IsNumber, IsString, Matches, Max, Min } from "class-validator";

export class UpdateProfileDto {
  @Matches(/(765611\d{11})/)
  @Optional()
  @IsString()
  steamId!: string;

  @Min(NotificationLevel.NONE)
  @Max(NotificationLevel.ALL)
  @IsNumber()
  notificationsLevel!: number;
}
