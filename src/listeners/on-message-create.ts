import { EventListener } from "fero-dc";
import { prisma } from "../util/prisma-client";
import { randomInteger } from "../util/random";

const HONK_EMOJI_ID = "639271354734215178";

export default new EventListener<"messageCreate">()
  .setEvent("messageCreate")
  .setListener(async (client, message) => {
    if (message.author.bot) {
      return;
    }

    if (message.guild === null) {
      return;
    }

    const lowerCaseMessageContent = message.content.toLowerCase();

    if (lowerCaseMessageContent.includes("goose")) {
      message.react("🦢").catch(console.log);
    }

    if (lowerCaseMessageContent.includes("honk")) {
      message.react(HONK_EMOJI_ID).catch(console.log);
    }

    const guildModel = await prisma.guild.findUnique({
      where: {
        id: message.guild.id
      }
    });

    if (guildModel === null) {
      console.log("Guild not found in the database");

      return;
    }

    if (!guildModel.features.scales) {
      return;
    }

    const randomAmount = randomInteger(1, 50);

    await prisma.user
      .updateMany({
        where: {
          id: message.author.id,
          banned: false
        },
        data: {
          scales: {
            increment: randomAmount
          }
        }
      })
      .catch(console.log);
  });
