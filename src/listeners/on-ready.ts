import { Client, EventListener } from "fero-dc";
import { prisma } from "../util/prisma-client";
import { type JsonActivity, LogType } from "../util/types";
import activities from "../config/activities.json" assert { type: "json" };
import { ActivityType } from "discord.js";
import { randomElement } from "../util/random";
import { getFactOfTheDay } from "../util/fact-api";
import { log } from "../util/logging";

export default new EventListener<"ready">()
	.setEvent("ready")
	.setHandler(async (client) => {
		console.log(`${client.user.tag} is online!`);

		setInterval(() => autoUnban(client), 10000);
		setInterval(() => setPresence(client), 60000);
	});

async function autoUnban(client: Client<true>): Promise<void> {
	const temporaryBanLogs = await prisma.log.findMany({
		where: {
			type: LogType.TemporaryBan,
			undone: false,
			undoBy: {
				lt: new Date(Date.now())
			}
		}
	});
	for (const temporaryBanLog of temporaryBanLogs) {
		const guild = await client.guilds
			.fetch(temporaryBanLog.guildId)
			.catch(() => undefined);
		const user = await client.users
			.fetch(temporaryBanLog.targetId)
			.catch(() => undefined);
		if (guild === undefined || user === undefined) {
			console.error("Guild or user not found");

			continue;
		}

		const reason = "Temporary ban expired";

		const unbannedUser = await guild.members
			.unban(user, reason)
			.catch(() => null);
		if (unbannedUser === null) {
			console.error("Failed to unban user");

			continue;
		}

		await log({
			client,
			type: LogType.Unban,
			guild,
			reason,
			moderator: client.user,
			args: [unbannedUser]
		});
	}
}

async function setPresence(client: Client<true>): Promise<void> {
	const randomActivity = <JsonActivity>randomElement(activities.activities);
	// handling the cases where the activity needs data
	switch (randomActivity.text) {
		case " members":
			randomActivity.text = `${client.guilds.cache.reduce(
				(acc, guild) => acc + guild.memberCount,
				0
			)} members`;

			break;

		case " on YouTube":
			randomActivity.text = `${randomElement(activities.youTubers)} on YouTube`;

			break;

		case "Fact of the Day": {
			const fact = await getFactOfTheDay();
			if (fact === undefined) {
				console.error("Failed to fetch fact of the day");

				return;
			}

			randomActivity.text = fact.text;

			break;
		}
	}

	client.user.setPresence({
		status: "online",
		activities: [
			{
				name: randomActivity.text,
				type: ActivityType[randomActivity.type]
			}
		]
	});
}
