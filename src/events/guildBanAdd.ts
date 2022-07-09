import { Event } from "fero-dc";
import { log } from "../scripts/log";
import { GuildAuditLogsAction } from "discord.js";

export default {
  event: "guildBanAdd",
  run: async (client, ban) => {
    ban = await ban.fetch(true);

    const user = ban.user;

    const reason = ban.reason || "No reason provided";

    const guild = ban.guild;

    const auditLogs = await guild.fetchAuditLogs();

    const auditLog = auditLogs.entries.first();

    if (
      auditLog &&
      (auditLog.action as GuildAuditLogsAction) === "MEMBER_BAN_ADD" &&
      Date.now() - auditLog.createdTimestamp < 10000 &&
      (auditLog.reason || "No reason provided") === reason &&
      auditLog.target?.id === user.id
    ) {
      const mod = auditLog.executor;

      if (mod && mod.id !== client.user?.id) {
        await log(client, "ban", guild, reason, mod, user);
      }
    }
  }
} as Event<"guildBanAdd">;
