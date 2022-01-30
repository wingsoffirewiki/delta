/** @format */

import { Event } from "fero-dc";
import { User } from "../models/User";
import { Guild, IGuild } from "../models/Guild";
import { getBannedWord } from "../scripts/getBannedWord";

type ReactionMessageContent = "goose" | "honk";

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    if (getBannedWord(message) && message.guild) return message.delete();

    const reactionMessage = ["goose", "honk"].find(v =>
      message.content?.toLowerCase().includes(v)
    ) as ReactionMessageContent;

    if (reactionMessage) {
      switch (reactionMessage) {
        case "goose":
          message.react("🦆").catch(console.log);
          break;

        case "honk":
          message.react("<:honk:639271354734215178>").catch(console.log);
          break;
      }
    }

    const guildModel: IGuild = await Guild.findOne({ _id: message.guild.id });

    if (!(guildModel?.features?.scales ?? true)) return;

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
