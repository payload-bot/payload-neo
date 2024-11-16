import { FT, T } from "#lib/types";

export const Name = T<string>("commands/webhook:name");
export const Description = T<string>("commands/webhook:description");
export const DetailedDescription = T<string>("commands/webhook:detailedDescription");
export const EmbedTitle = T<string>("commands/webhook:embedTitle");
export const NoWebhook = T<string>("commands/webhook:noWebhook");
export const CreateWebhook = T<string>("commands/webhook:createWebhook");
export const CreatedWebhook = FT<string, { secret: string }>("commands/webhook:createdWebhook");
export const DeleteWebhook = T<string>("commands/webhook:deleteWebhook");
export const DeletedWebhook = T<string>("commands/webhook:deletedWebhook");
