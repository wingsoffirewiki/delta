/** @format */

import { Snowflake } from "discord.js";
import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: Snowflake;
  scales: number;
  banned: boolean;
  enablePayments: boolean;
  __v: number;
}

export const User = model(
  "User",
  new Schema({
    _id: String,
    scales: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
    enablePayments: { type: Boolean, default: true }
  })
);
