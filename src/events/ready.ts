import { Event } from "fero-dc";
import { autoUnban } from "../scripts/autoUnban";
import { setPresence } from "../scripts/setPresence";

export default {
  event: "ready",
  run: async (client) => {
    // const result = await client.commands
    //   .find(cmd => cmd.name === "set")
    //   ?.delete(client);
    // console.log(result);
    // const commands = await client.application?.commands.fetch({
    //   cache: true,
    //   force: true
    // });
    // commands?.forEach(command => command.delete().then(console.log));

    console.log(`${client.user?.tag} is online!`);

    autoUnban(client);
    setPresence(client);
  }
} as Event<"ready">;
