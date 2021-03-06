import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import MemberModel from "../../models/MemberModel";
import { getModelForClass } from "@typegoose/typegoose";

export default class Case extends Command {
  public constructor() {
    super("case", {
      aliases: ["case"],
      category: "Moderation",
      channel: "guild",
      description: {
        content: "Shows details from a case.",
        usage: "case [caseId]",
        examples: ["case e0libeskjf7cuys"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "id",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a valid case ID to show...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid case ID to show...`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { id }: { id: string }
  ): Promise<void | Message> {
    const embed = new MessageEmbed().setColor(0x00ff0c);
    const sanctionsModel = getModelForClass(MemberModel);
    try {
      var sanctionsData = await sanctionsModel.findOne({
        guildId: message.guild.id,
        "sanctions.caseID": id,
      });
      if (
        !sanctionsData ??
        sanctionsData.sanctions === null ??
        sanctionsData.sanctions.length < 1 ??
        sanctionsData.sanctions === undefined
      ) {
        embed.setColor(0xff0000);
        embed.setDescription(`No modlogs found for that user.`);
        return message.util.send(embed);
      } else if (!sanctionsData.sanctions.filter((r) => r.caseID === id)) {
        embed.setColor(0xff0000);
        embed.setDescription(`No case matching provided ID found.`);
        return message.util.send(embed);
      }
    } catch (e) {}
    const s = sanctionsData.sanctions.filter((r) => r.caseID === id)[0];
    embed.setAuthor(
      `Case - ${id}`,
      message.author.displayAvatarURL({ dynamic: true })
    );
    embed.setDescription("All times are in UTC");
    if (s.type === "Mute") {
      embed.addField(
        s.type,
        `Moderator: <@!${s.moderatorId}>\nUser: **${s.user}**\nReason: **${s.reason}**\nTime: **${s.time}**\nDate: **${s.date}**`
      );
      return message.util.send(embed);
    }
    embed.addField(
      s.type,
      `Moderator: <@!${s.moderatorId}>\nUser: **${s.user}**\nReason: **${s.reason}**\nDate: **${s.date}**`
    );
    return message.util.send(embed);
  }
}
