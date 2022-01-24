/** @format */

import { Event } from "fero-dc";
import { User } from "../models/User";
import { getBannedWord } from "../scripts/getBannedWord";

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot) return;

    if (getBannedWord(message) && message.guild) return message.delete();

    try {
      const randomAmount = Math.floor(Math.random() * 50) + 1;

      User.findOneAndUpdate(
        {
          _id: message.author.id,
          banned: false
        },
        {
          $inc: {
            scales: randomAmount
          }
        },
        { upsert: true }
      ).exec();
    } catch (err) {
      console.log(err);
    }

    return;
  }
} as Event<"messageCreate">;
