import { Event } from "fero-dc";
import { log } from "../util/log";
import { getBannedWord } from "../util/getBannedWord";

export default {
  event: "messageUpdate",
  run: async (client, oldMessage, newMessage) => {
    newMessage = await newMessage.fetch(true);

    if (!newMessage.guild || !newMessage.author || newMessage.author.bot) {
      return;
    }

    await log(
      client,
      "messageEdit",
      newMessage.guild,
      "",
      newMessage.author,
      oldMessage,
      newMessage
    );

    if (getBannedWord(newMessage)) {
      await newMessage.delete();
    }
  }
} as Event<"messageUpdate">;
