import { Schema, model } from "mongoose";

export interface ICommandRestrictions {
  channelID: string;
  commands: Array<string>;
}

export type ServerModel = Document & {
  id: string;
  prefix?: string;
  language?: string;

  enableSnipeForEveryone?: boolean;

  commandRestrictions?: ICommandRestrictions[];

  webhook?: string;

  fun?: {
    payloadFeetPushed: number;
    payloadBeingDefended: boolean;
    payloadDefendTimeout: number;
  };
};

const serverSchema = new Schema({
  id: String,
  prefix: String,
  language: String,

  enableSnipeForEveryone: Boolean,

  webhook: {
    ref: "Webhook",
    type: Schema.Types.ObjectId,
  },

  commandRestrictions: [
    {
      channelID: String,
      commands: [String],
    },
  ],

  fun: {
    payloadFeetPushed: Number,
    payloadBeingDefended: Boolean,
    payloadDefendTimeout: Number,
  },
});

export const Server = model<ServerModel>("Server", serverSchema);
