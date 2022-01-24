/** @format */

import { Event } from "fero-dc";
import { log } from "../scripts/log";
import { getBannedWord } from "../scripts/getBannedWord";

export default {
  event: "messageDelete",
  run: async (client, message) => {
    if (!message.guild || !message.author) return;

    await log(
      client,
      "messageDelete",
      message.guild,
      "",
      message.author,
      message
    );

    if (getBannedWord(message))
      await log(
        client,
        "bannedWordDetected",
        message.guild,
        "",
        message.author,
        message
      );
  }
} as Event<"messageDelete">;
