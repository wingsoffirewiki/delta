import { Guild, User } from "discord.js";
import { Event } from "fero-dc";
import { log } from "../util/log";

export default {
  event: "messageDeleteBulk",
  run: async (client, messages) => {
    await log(
      client,
      "bulkDelete",
      messages.first()?.guild as Guild,
      "",
      client.user as User,
      ...messages.map((v) => v)
    );
  }
} as Event<"messageDeleteBulk">;
