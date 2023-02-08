import { Client, EventListener } from "fero-dc";
import { prisma } from "../db";
import { JsonActivity, LogType, UselessFactsResponse } from "../types";
import apiUrls from "../config/api-urls.json" assert { type: "json" };
import activities from "../config/activities.json" assert { type: "json" };
import { ActivityType } from "discord.js";

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

    const result = await guild.members.unban(user, "Temporary ban expired");

    if (result === null) {
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
  const randomActivity = <JsonActivity>(
    activities.activities[
      Math.floor(Math.random() * activities.activities.length)
    ]
  );

  // handling the cases where the activity needs data
  switch (randomActivity.text) {
    case " members":
      randomActivity.text = `${client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      )} members`;

      break;

    case " on YouTube":
      randomActivity.text = `${
        activities.youTubers[
          Math.floor(Math.random() * activities.youTubers.length)
        ]
      } on YouTube`;

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

function getFactOfTheDay(): Promise<UselessFactsResponse> {
  return fetch(apiUrls.uselessFacts.daily)
    .then((response) => response.json())
    .catch(() => undefined);
}
