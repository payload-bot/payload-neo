import type { Message, Collection } from "discord.js";

export interface SnipeCache {
  snipe: {
    [guild: string]: {
      [channel: string]: Collection<string, Message>;
    };
  };

  pings: {
    [guild: string]: {
      [channel: string]: Collection<string, Message>;
    };
  };
}
