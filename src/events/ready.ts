/** @format */

import { Event } from "fero-dc";

export default {
  event: "ready",
  run: async client => {
    // const result = await client.commands
    //   .find(cmd => cmd.name === "lookup")
    //   ?.delete(client);
    // console.log(result);
    // const commands = await client.application?.commands.fetch({
    //   cache: true,
    //   force: true
    // });
    // commands?.forEach(command => command.delete().then(console.log));
  }
} as Event<"ready">;
