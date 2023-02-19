import { EventListener } from "fero-dc";
import { LogType } from "../../util/types";
import { log } from "../../util/logging";
import { AuditLogEvent } from "discord.js";

export default new EventListener<"guildMemberRemove">()
	.setEvent("guildMemberRemove")
	.setListener(async (client, member) => {
		const guild = member.guild;
		const user = member.user;

		const auditLog = await guild
			.fetchAuditLogs({
				limit: 1,
				type: AuditLogEvent.MemberKick
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
			type: LogType.Kick,
			guild,
			reason,
			moderator,
			args: [user]
		});
	});
