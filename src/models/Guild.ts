/** @format */

import { model, Schema } from "mongoose";

const blankID = "000000000000000000";

const schema = new Schema(
  {
    _id: String,
    channelIDs: {
      logs: {
        type: String,
        default: blankID
      },
      modLogs: {
        type: String,
        default: blankID
      },
      adminLogs: {
        type: String,
        default: blankID
      },
      funnies: {
        type: String,
        default: blankID
      }
    },
    roleIDs: {
      mute: {
        type: String,
        default: blankID
      },
      mods: {
        type: Array,
        default: []
      }
    },
    messages: {
      leaderboard: {
        type: String,
        default: blankID
      }
    },
    features: {
      scales: {
        type: Boolean,
        default: true
      },
      logging: {
        type: Boolean,
        default: true
      },
      modLogging: {
        type: Boolean,
        default: true
      },
      adminLogging: {
        type: Boolean,
        default: true
      },
      moderation: {
        type: Boolean,
        default: true
      },
      starboard: {
        type: Boolean,
        default: true
      }
    }
  },
  { timestamps: true }
);

export default model("Guild", schema);
