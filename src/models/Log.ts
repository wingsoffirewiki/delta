/** @format */

import { model, Schema, Types } from "mongoose";

const schema = new Schema(
  {
    _id: Types.ObjectId,
    guildID: String,
    userID: String,
    modID: String,
    reason: String,
    type: Number,
    embedID: String,
    undoBy: Number,
    undone: Boolean
  },
  { timestamps: true }
);

export default model("Log", schema);
