import {number, object, string } from "joi";
import { NotificationLevel } from "../../util/push-notification";

const userSettingsSchema = object({
    steamID: string().pattern(/(765611\d{11})/),
    notificationsLevel: number().min(NotificationLevel.NONE).max(NotificationLevel.ALL),
});

export default userSettingsSchema;
