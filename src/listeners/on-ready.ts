import { Client, EventListener } from "fero-dc";
import { prisma } from "../util/prisma-client";
import { JsonActivity, LogType } from "../util/types";
import activities from "../config/activities.json" assert { type: "json" };
import { ActivityType } from "discord.js";
import { randomElement } from "../util/random";
import { getFactOfTheDay } from "../util/fact-api";

export default new EventListener<"ready">()
  .setEvent("ready")
  .setListener(async (client) => {
    console.log(`${client.user.tag} is online!`);

    setInterval(() => autoUnban(client), 10000);
    setInterval(() => setPresence(client), 60000);
  });

async function autoUnban(client: Client<true>) {
  const logs = await prisma.log.findMany({
    where: {
      type: LogType.TemporaryBan,
      undone: false,
      undoBy: {
        lt: new Date(Date.now())
      }
    }
  });
  for (const log of logs) {
    const guild = await client.guilds.fetch(log.guildId).catch(() => undefined);
    const user = await client.users.fetch(log.targetId).catch(() => undefined);
    if (guild === undefined || user === undefined) {
      console.error("Guild or user not found");

      continue;
    }

    const unbannedUser = await guild.members.unban(
      user,
      "Temporary ban expired"
    );
    if (unbannedUser === null) {
      console.error("Failed to unban user");

      continue;
    }

    // TODO: log the event here

    await prisma.log.update({
      where: {
        id: log.id
      },
      data: {
        undone: true
      }
    });
  }
}

async function setPresence(client: Client<true>) {
  const randomActivity = <JsonActivity>randomElement(activities.activities);
  // handling the cases where the activity needs data
  switch (randomActivity.text) {
    case " members":
      randomActivity.text = `${client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      )} members`;

      break;

    case " on YouTube":
      randomActivity.text = `${randomElement(activities.youTubers)} on YouTube`;

      break;

    case "Fact of the Day": {
      const fact = await getFactOfTheDay();
      if (fact === undefined) {
        console.error("Failed to fetch fact of the day");

        return;
      }

      randomActivity.text = fact.text;

      break;
    }
  }

  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: randomActivity.text,
        type: ActivityType[randomActivity.type]
      }
    ]
  });
}
