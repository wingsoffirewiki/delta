import { Event } from "fero-dc";
import { prisma } from "../db";
import { getBannedWord } from "../util/getBannedWord";

type ReactionMessageContent = "goose" | "honk";

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) {
      return;
    }

    if (getBannedWord(message) && message.guild) {
      return message.delete();
    }

    const reactionMessage = ["goose", "honk"].find((v) =>
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

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: message.guild.id
      }
    });

    if (!guildModel) {
      console.log("Guild not found in database");
      return;
    }

    if (!(guildModel?.features?.scales ?? true)) {
      return;
    }

    try {
      const randomAmount = Math.floor(Math.random() * 50) + 1;

      await prisma.user.updateMany({
        where: {
          id: message.author.id,
          banned: false
        },
        data: {
          scales: {
            increment: randomAmount
          }
        }
      });
    } catch (err) {
      console.log(err);
    }

    return;
  }
} as Event<"messageCreate">;
