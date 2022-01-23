/** @format */

import { Snowflake } from "discord.js";
import { model, Schema } from "mongoose";

const blankID = "000000000000000000";

export interface IGuild {
  _id: Snowflake;
  channelIDs: {
    logs: Snowflake;
    modLogs: Snowflake;
    adminLogs: Snowflake;
    funnies: Snowflake;
  };
  roleIDs: {
    mute: Snowflake;
    mods: Snowflake[];
  };
  features: {
    scales: boolean;
    logging: boolean;
    modLogging: boolean;
    adminLogging: boolean;
    moderation: boolean;
    funnies: boolean;
  };
  __v: number;
}

export const Guild = model(
  "Guild",
  new Schema(
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
  )
);
