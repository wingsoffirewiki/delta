/** @format */

import { model, Schema, Types } from "mongoose";

const schema = new Schema({
  _id: Types.ObjectId,
  guildID: String,
  userID: String,
  message: {
    id: String,
    channelID: String
  }
});

export default model("Funnie", schema);
