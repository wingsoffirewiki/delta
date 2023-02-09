import { EventListener } from "fero-dc";

const WOF_CODE_PROJECTS_GUILD_ID = "576534597697798154";
const VERIFICATION_CHANNEL_ID = "734249352205434881";

export default new EventListener<"guildMemberAdd">()
  .setEvent("guildMemberAdd")
  .setListener((client, member) => {
    const guild = member.guild;
    if (guild.id !== WOF_CODE_PROJECTS_GUILD_ID) {
      return;
    }

    const verificationChannel = guild.channels.cache.get(
      VERIFICATION_CHANNEL_ID
    );
    if (
      verificationChannel === undefined ||
      !verificationChannel.isTextBased()
    ) {
      return;
    }

    const systemChannel = guild.systemChannel;
    if (systemChannel === null) {
      return;
    }

    verificationChannel.send(`${member} Verification instructions are pinned.`);
    systemChannel.send(`${member} Please read the long pin in this channel.`);
  });
