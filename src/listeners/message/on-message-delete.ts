import { EventListener } from "@ferod/client";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

export default new EventListener<"messageDelete">()
	.setEvent("messageDelete")
	.setHandler(async (client, message) => {
		const guild = message.guild;
		const author = message.author;
		if (guild === null || author === null || author.bot) {
			return;
		}

		await log({
			client,
			type: LogType.MessageDelete,
			guild,
			args: [message]
		});
	});
