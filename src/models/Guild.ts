/** @format */

import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    _id: String,
    channelIDs: {
      logs: String,
      modLogs: String,
      adminLogs: String,
      funnies: String
    },
    roleIDs: {
      mute: String,
      mods: Array
    },
    messages: {
      leaderboard: String
    },
    features: {
      scales: Boolean,
      logging: Boolean,
      modLogging: Boolean,
      adminLogging: Boolean,
      moderation: Boolean,
      starboard: Boolean
    }
  },
  { timestamps: true }
);

export default model("Guild", schema);
