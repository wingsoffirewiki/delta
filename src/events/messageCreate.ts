/** @format */

import { Event } from "fero-dc";
import User from "../models/User";

export default {
  event: "messageCreate",
  run: async (client, message) => {
    try {
      const randomAmount = Math.floor(Math.random() * 50) + 1;

      // @ts-ignore
      const userModel = await User.findOneAndUpdate(
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
      );
    } catch (err) {
      console.log(err);
    }
  }
} as Event<"messageCreate">;
