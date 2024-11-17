import { T } from "#lib/types";

export const Name = T<string>("commands/guild-webhook:name");
export const Description = T<string>("commands/guild-webhook:description");
export const DetailedDescription = T<string>("commands/guild-webhook:detailedDescription");

export const AddName = T<string>("commands/guild-webhook:addName");
export const AddDescription = T<string>("commands/guild-webhook:addDescription");
export const AddChannelIdName = T<string>("commands/guild-webhook:addChannelIdName");
export const AddChannelIdDescription = T<string>("commands/guild-webhook:addChannelIdDescription");
export const AddFailed = T<string>("commands/guild-webhook:addFailed");
export const RemoveName = T<string>("commands/guild-webhook:removeName");
export const RemoveDescription = T<string>("commands/guild-webhook:removeDescription");
export const ShowName = T<string>("commands/guild-webhook:removeName");
export const ShowDescription = T<string>("commands/guild-webhook:removeDescription");