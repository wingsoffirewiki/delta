/** @format */

import { Snowflake } from "discord.js";
import { model, Schema, Types } from "mongoose";

export interface ILog {
  _id: Types.ObjectId;
  guildID: Snowflake;
  targetID: Snowflake;
  modID: Snowflake;
  logID: number;
  reason: string;
  type: number;
  embedID: Snowflake;
  undoBy: number;
  undone: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export const Log = model(
  "Log",
  new Schema(
    {
      _id: Types.ObjectId,
      guildID: String,
      targetID: String,
      modID: String,
      logID: Number,
      reason: String,
      type: Number,
      embedID: String,
      undoBy: Number,
      undone: Boolean
    },
    { timestamps: true }
  )
);
