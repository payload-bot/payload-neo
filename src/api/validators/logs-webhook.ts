import { object, string } from "joi";

const logsWebhookSchema = object({
    logsId: string().required(),
});

export default logsWebhookSchema;
