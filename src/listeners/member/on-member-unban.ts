import { EventListener } from "fero-dc";
import { log } from "../../util/logging";
import { LogType } from "../../util/types";
import { AuditLogEvent } from "discord.js";

export default new EventListener<"guildBanRemove">()
	.setEvent("guildBanRemove")
	.setHandler(async (client, ban) => {
		const guild = ban.guild;
		const user = ban.user;

		const auditLog = await guild
			.fetchAuditLogs({
				limit: 1,
				type: AuditLogEvent.MemberBanRemove
			})
			.then((auditLogs) => auditLogs.entries.first())
			.catch(() => undefined);
		if (auditLog === undefined) {
			return;
		}

		if (auditLog.executor?.id === client.user.id) {
			return;
		}

		const moderator = auditLog.executor ?? client.user;
		const reason = auditLog.reason ?? "No reason provided";

		await log({
			client,
			type: LogType.Unban,
			guild,
			reason,
			moderator,
			args: [user]
		});
	});
