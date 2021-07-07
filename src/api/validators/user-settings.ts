import {number, object, string } from "joi";
import { NotificationLevel } from "../../util/push-notification";

const userSettingsSchema = object({
    steamId: string().allow('').regex(/(765611\d{11})/).optional().default(null),
    notificationsLevel: number().min(NotificationLevel.NONE).max(NotificationLevel.ALL),
});

export default userSettingsSchema;
