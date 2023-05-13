import { EventListener } from "@ferod/client";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

export default new EventListener<"messageDeleteBulk">()
	.setEvent("messageDeleteBulk")
	.setHandler(async (client, messages) => {
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
