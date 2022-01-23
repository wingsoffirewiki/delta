/** @format */

import { Client } from "fero-dc";
import { Log, ILog } from "../models/Log";
import { log, LogEnum } from "./log";

export function autoUnban(client: Client) {
  setInterval(async () => {
    const logs: ILog[] = await Log.find({
      type: LogEnum["tempban"],
      undone: false,
      undoBy: {
        $lt: new Date(Date.now())
      }
    });

    logs.forEach(async l => {
      try {
        const guild = await client.guilds.fetch(l.guildID);

        const user = await client.users.fetch(l.targetID);

        if (!client.user) throw `Client user not found.`;

        await log(
          client,
          "unban",
          guild,
          "Delta Automation",
          client.user,
          user
        );

        Log.findOneAndUpdate(
          {
            _id: l._id
          },
          {
            undone: true
          }
        );
      } catch (err) {
        console.log(err);
      }
    });
  }, 10000);
}
