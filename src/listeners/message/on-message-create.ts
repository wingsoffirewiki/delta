import { EventListener } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import { randomInteger } from "../../util/random";
import { isFeatureEnabled } from "../../util/features";

const HONK_EMOJI_ID = "639271354734215178";

export default new EventListener<"messageCreate">()
	.setEvent("messageCreate")
	.setListener(async (client, message) => {
		if (message.author.bot) {
			return;
		}

		const guild = message.guild;
		if (guild === null) {
			return;
		}

		const lowerCaseMessageContent = message.content.toLowerCase();
		if (lowerCaseMessageContent.includes("goose")) {
			message.react("🦢").catch((error) => console.log(error.message));
		}
		if (lowerCaseMessageContent.includes("honk")) {
			message.react(HONK_EMOJI_ID).catch((error) => console.log(error.message));
		}

		if (!(await isFeatureEnabled(guild, "scales"))) {
			return;
		}

		const randomAmount = randomInteger(1, 50);

		await prisma.user
			.updateMany({
				where: {
					id: message.author.id,
					banned: false
				},
				data: {
					scales: {
						increment: randomAmount
					}
				}
			})
			.catch((error) => console.log(error.message));
	});
