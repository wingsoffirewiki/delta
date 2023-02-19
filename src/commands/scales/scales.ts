import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "fero-dc";
import { prisma } from "../../util/prisma-client";
import { isFeatureEnabled } from "../../util/features";

export default new Command()
	.setName("scales")
	.setDescription("Show and manage your scales")
	.setCategory("Scales")
	.setOptions(
		{
			name: "pay",
			description: "Pay a user some scales",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to pay scales to",
					type: ApplicationCommandOptionType.User,
					required: true
				},
				{
					name: "amount",
					description: "The amount of scales to pay to the user",
					type: ApplicationCommandOptionType.Integer,
					required: true
				}
			]
		},
		{
			name: "balance",
			description: "Get the balance of yourself or another user",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to get the balance of",
					type: ApplicationCommandOptionType.User,
					required: false
				}
			]
		}
	)
	.setRun(async (client, interaction) => {
		await interaction.deferReply();

		const guild = interaction.guild;
		if (guild === null) {
			interaction.followUp("Failed to get guild");

			return;
		}
		if (!(await isFeatureEnabled(guild, "scales"))) {
			interaction.followUp("Scales feature is not enabled");

			return;
		}

		const author = interaction.user;

		const subcommand = interaction.options.getSubcommand(true);
		switch (subcommand) {
			case "pay": {
				const user = interaction.options.getUser("user", true);
				const amount = interaction.options.getInteger("amount", true);

				if (user.id === author.id) {
					interaction.followUp("You cannot pay yourself scales");

					return;
				}

				if (amount < 1) {
					interaction.followUp("You cannot pay less than 1 scale");

					return;
				}

				const authorModel = await prisma.user.findUnique({
					where: {
						id: author.id
					}
				});
				if (authorModel === null) {
					interaction.followUp("Failed to get author model");

					return;
				}
				if (authorModel.banned) {
					interaction.followUp("You are banned from using scales");

					return;
				}
				if (authorModel.scales < amount) {
					interaction.followUp(
						"You do not have enough scales to pay that amount"
					);

					return;
				}

				const userModel = await prisma.user.findUnique({
					where: {
						id: user.id
					}
				});
				if (userModel === null) {
					interaction.followUp("Failed to get user model");

					return;
				}
				if (userModel.banned) {
					interaction.followUp("That user is banned from using scales");

					return;
				}
				if (!userModel.enablePayments) {
					interaction.followUp("That user has disabled payments");

					return;
				}

				const authorUpdatePromise = prisma.user.update({
					where: {
						id: author.id
					},
					data: {
						scales: {
							decrement: amount
						}
					}
				});
				const userUpdatePromise = prisma.user.update({
					where: {
						id: user.id
					},
					data: {
						scales: {
							increment: amount
						}
					}
				});

				await Promise.all([authorUpdatePromise, userUpdatePromise]);

				interaction.followUp(`You have paid ${user} ${amount} scales`);

				break;
			}

			case "balance": {
				const user = interaction.options.getUser("user") ?? interaction.user;

				const userModel = await prisma.user.findUnique({
					where: {
						id: user.id
					},
					select: {
						scales: true
					}
				});
				if (userModel === null) {
					interaction.followUp("Failed to get user model");

					return;
				}

				const message =
					user.id === author.id ? "You have" : `\`${user.tag}\` has`;

				interaction.followUp(`${message} \`${userModel.scales}\` scales!`);

				break;
			}

			default:
				interaction.followUp("Invalid subcommand");
		}
	});
