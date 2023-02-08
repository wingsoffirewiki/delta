import type { ActivityType } from "discord.js";

export enum LogType {
  Ban,
  TemporaryBan,
  Timeout,
  Unban,
  Warn,
  Kick,
  MessageEdit,
  MessageDelete,
  BulkMessageDelete,
  BannedWordDetected
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
