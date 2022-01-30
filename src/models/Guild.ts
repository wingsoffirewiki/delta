/** @format */

import { Snowflake } from "discord.js";
import { Document, model, Schema } from "mongoose";

const blankID = "000000000000000000";

export interface IGuild extends Document {
  _id: Snowflake;
  channelIDs: {
    logs: Snowflake;
    modLogs: Snowflake;
    adminLogs: Snowflake;
    funnies: Snowflake;
  };
  roleIDs: {
    mods: Snowflake[];
    verified: Snowflake;
  };
  messages: {
    verification: {
      id: Snowflake;
      channelID: Snowflake;
    };
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
        mods: {
          type: Array,
          default: []
        },
        verified: {
          type: String,
          default: blankID
        }
      },
      messages: {
        verification: {
          id: {
            type: String,
            default: blankID
          },
          channelID: {
            type: String,
            default: blankID
          }
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
        funnies: {
          type: Boolean,
          default: true
        }
      }
    },
    { timestamps: true }
  )
);
