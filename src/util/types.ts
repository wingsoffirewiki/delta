import type {
  ActivityType,
  User,
  Message,
  PartialMessage,
  Guild
} from "discord.js";
import { Client } from "fero-dc";

export const NULL_SNOWFLAKE = "0000000000000000000";

export enum LogType {
  Ban,
  TemporaryBan,
  Timeout,
  Unban,
  Warn,
  Kick,
  MessageEdit,
  MessageDelete,
  BulkMessageDelete
}

export interface LogData {
  [LogType.Ban]: [User];
  [LogType.TemporaryBan]: [User, Date, number];
  [LogType.Timeout]: [User, Date, number];
  [LogType.Unban]: [User];
  [LogType.Warn]: [User];
  [LogType.Kick]: [User];
  [LogType.MessageEdit]: [Message | PartialMessage, Message | PartialMessage];
  [LogType.MessageDelete]: [Message | PartialMessage];
  [LogType.BulkMessageDelete]: [Message[]];
}

export interface LogOptions<T extends LogType> {
  client: Client<true>;
  type: T;
  guild: Guild;
  reason: string;
  moderator: User;
  args: LogData[T];
}

export interface UselessFactsResponse {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: string;
  permalink: string;
}

export interface JsonActivity {
  type: Exclude<keyof typeof ActivityType, "Custom">;
  text: string;
}
