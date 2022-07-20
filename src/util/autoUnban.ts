

import { Client } from "fero-dc";
import { prisma } from "../db";
import { log, LogType } from "./log";

export function autoUnban(client: Client) {
  setInterval(async () => {
    const logs = await prisma.log.findMany({
      where: {
        type: LogType.tempban,
        undone: false,
        undoBy: {
          lt: new Date(Date.now())
        }
      }
    });

    logs.forEach(async (l) => {
      try {
        const guild = await client.guilds.fetch(l.guildID);

        const user = await client.users.fetch(l.targetID);

        if (!client.user) {
          throw `Client user not found.`;
        }

        await log(
          client,
          "unban",
          guild,
          "`Delta automatically unbanned tempbanned user`",
          client.user,
          user
        );

        await prisma.log.update({
          where: {
            id: l.id
          },
          data: {
            undone: true
          }
        });

        await guild.members.unban(
          user,
          "Delta automatically unbanned tempbanned user"
        );
      } catch (err) {
        console.log(err);
      }
    });
  }, 10000);
}
