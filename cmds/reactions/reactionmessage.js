const Commando = require("discord.js-commando");
const reactionRolesSchema = require("../../schemas/reaction-roles-schema");
const { addToCache } = require("../../features/features/reaction-roles");

module.exports = class BalanceCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "reactionmessage",
			group: "reactions",
			memberName: "reactionmessage",
			userPermissions: ["ADMINISTRATOR"],
			description: "Create message to reaction.",
			argsType: "multiple",
		});
	}

	async run(message, args) {
		const { guild, mentions } = message;
		const { channels } = mentions;
		const targetChannel = channels.first() || message.channel;

		if (channels.first()) {
			args.shift();
		}

		const text = args.join(" ");

		const newMessage = await targetChannel.send(text);

		if (guild.me.hasPermission("MANAGE_MESSAGES")) {
			message.delete();
		}

		if (!guild.me.hasPermission("MANAGE_ROLES")) {
			message.reply(
				"The bot requires access to manage roles to be able to give or remove roles"
			);
			return;
		}

		addToCache(guild.id, newMessage);

		new reactionRolesSchema({
			guildId: guild.id,
			channelId: targetChannel.id,
			messageId: newMessage.id,
		})
			.save()
			.catch(() => {
				message
					.reply("Failed to save to the database, please report this!")
					.then((message) => {
						message.delete({
							timeout: 1000 * 10,
						});
					});
			});
	}
};
