/** @format */

import { Snowflake } from "discord.js";
import { Document, model, Schema, Types } from "mongoose";

export interface IFunnie extends Document {
  _id: Types.ObjectId;
  guildID: Snowflake;
  userID: Snowflake;
  message: {
    id: Snowflake;
    channelID: Snowflake;
    embedID: Snowflake;
  };
  __v: number;
}

export const Funnie = model(
  "Funnie",
  new Schema({
    _id: Types.ObjectId,
    guildID: String,
    userID: String,
    message: {
      id: String,
      channelID: String,
      embedID: String
    }
  })
);
