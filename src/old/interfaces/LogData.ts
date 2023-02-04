import { Message, PartialMessage, User } from "discord.js";

export interface LogData {
  ban: [User];
  tempban: [User, Date, number];
  timeout: [User, Date, number];
  unban: [User];
  warn: [User];
  kick: [User];
  messageEdit: [Message | PartialMessage, Message | PartialMessage];
  messageDelete: [Message | PartialMessage];
  bulkDelete: (Message | PartialMessage)[];
  bannedWordDetected: [Message | PartialMessage];
}
