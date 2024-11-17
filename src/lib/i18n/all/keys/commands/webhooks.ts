import { T } from "#lib/types";

export const Name = T<string>("commands/webhooks:name");
export const Description = T<string>("commands/webhooks:description");
export const DetailedDescription = T<string>("commands/webhooks:detailedDescription");

export const AddName = T<string>("commands/webhooks:addName");
export const AddDescription = T<string>("commands/webhooks:addDescription");
export const AddChannelIdName = T<string>("commands/webhooks:addChannelIdName");
export const AddChannelIdDescription = T<string>("commands/webhooks:addChannelIdDescription");
export const AddFailed = T<string>("commands/webhooks:addFailed");
export const RemoveName = T<string>("commands/webhooks:removeName");
export const RemoveDescription = T<string>("commands/webhooks:removeDescription");
export const ShowName = T<string>("commands/webhooks:showName");
export const ShowDescription = T<string>("commands/webhooks:removeDescription");