/** @format */

import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    _id: String,
    channelIDs: {
      logs: {
        type: String,
        default: ""
      },
      modLogs: {
        type: String,
        default: ""
      },
      adminLogs: {
        type: String,
        default: ""
      },
      funnies: {
        type: String,
        default: ""
      }
    },
    roleIDs: {
      mute: {
        type: String,
        default: ""
      },
      mods: Array
    },
    messages: {
      leaderboard: {
        type: String,
        default: ""
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
