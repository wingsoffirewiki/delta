import type { User } from "discord.js";

export enum LogType {
  BAN,
  TEMPORARY_BAN,
  TIMEOUT,
  UNBAN,
  WARN,
  KICK,
  MESSAGE_EDIT,
  MESSAGE_DELETE,
  BULK_MESSAGE_DELETE,
  BANNED_WORD_DETECTED
}
