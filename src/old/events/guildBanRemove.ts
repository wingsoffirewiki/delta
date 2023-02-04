import { GuildAuditLogsAction } from "discord.js";
import { Event } from "fero-dc";
import { log } from "../util/log";

export default {
  event: "guildBanRemove",
  run: async (client, ban) => {
    const user = ban.user;

    const reason = ban.reason || "No reason provided";

    const guild = ban.guild;

    const auditLogs = await guild.fetchAuditLogs();

    const auditLog = auditLogs.entries.first();

    if (
      auditLog &&
      (auditLog.action as GuildAuditLogsAction) === "MEMBER_BAN_REMOVE" &&
      Date.now() - auditLog.createdTimestamp < 10000 &&
      auditLog.target?.id === user.id
    ) {
      const mod = auditLog.executor;

      if (mod && mod.id !== client.user?.id) {
        await log(client, "unban", guild, reason, mod, user);
      }
    }
  }
} as Event<"guildBanRemove">;
