import { EventListener } from "@ferod/client";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";

export default new EventListener<"messageUpdate">()
	.setEvent("messageUpdate")
	.setHandler(async (client, oldMessage, newMessage) => {
		const fetchedNewMessage = await newMessage.fetch(true);

		const guild = fetchedNewMessage.guild;
		if (
			guild === null ||
			fetchedNewMessage.author === null ||
			fetchedNewMessage.author.bot
		) {
			return;
		}

		await log({
			client,
			type: LogType.MessageEdit,
			guild,
			args: [oldMessage, fetchedNewMessage]
		});
	});
