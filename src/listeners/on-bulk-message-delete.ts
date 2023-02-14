import { EventListener } from "fero-dc";
import { log } from "../util/logging";
import { LogType } from "../util/types";

export default new EventListener<"messageDeleteBulk">()
  .setEvent("messageDeleteBulk")
  .setListener(async (client, messages) => {
    const guild = messages.first()?.guild ?? null;
    if (guild === null) {
      return;
    }

    await log({
      client,
      type: LogType.BulkMessageDelete,
      guild,
      args: [[...messages.values()]]
    });
  });