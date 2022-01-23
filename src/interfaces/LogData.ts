/** @format */

import { User } from "discord.js";

export interface LogData {
  ban: [User];
  tempban: [User, Date, number];
  timeout: [User, Date, number];
  unban: [User];
  warn: [User];
  kick: [User];
}
