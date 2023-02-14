import { EventListener } from "fero-dc";
import { log } from "../util/logging";
import { LogType } from "../util/types";

export default new EventListener<"messageUpdate">()
	.setEvent("messageUpdate")
	.setListener(async (client, oldMessage, newMessage) => {
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
