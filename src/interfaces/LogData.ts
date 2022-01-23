/** @format */

import { GuildMember, User } from "discord.js";

export interface LogData {
  ban: [GuildMember];
  tempban: [GuildMember, number];
  timeout: [GuildMember];
  unban: [User];
  warn: [GuildMember];
}
