import type { Message } from "discord.js";
import type { AutoCommand } from "./AutoResponse.ts";

export interface AutoCommandAcceptedPayload {
  command: AutoCommand;
  message: Message;
  context: AutoCommand.RunContext;
}

export interface AutoCommandPreCommandPayload {
  message: Message;
  possibleAutoCommands: AutoCommand[];
}
