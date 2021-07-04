import { object, string } from "joi";

const webhookSchema = object({
    token: string().required(),
});

export default webhookSchema;
