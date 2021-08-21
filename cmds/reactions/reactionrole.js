const Commando = require("discord.js-commando");
const {
	fetchCache,
	addToCache,
} = require("../../features/features/reaction-roles");
const reactionRolesSchema = require("../../schemas/reaction-roles-schema");

module.exports = class ReactionRoleCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "reactionrole",
			group: "reactions",
			memberName: "reactionrole",
			userPermissions: ["ADMINISTRATOR"],
			description: "Add reaction role to message.",
			argsType: "multiple",
		});
	}

	async run(message, args) {
		const { guild } = message;

		if (!guild.me.hasPermission("MANAGE_ROLES")) {
			message.reply(
				"The bot requires access to manage roles to work correctly"
			);
			return;
		}

		let emoji = args.shift(); // 🎮
		let role = args.shift(); // Warzone
		const displayName = args.join(" "); // 'Warzone game nights'

		if (role.startsWith("<@&")) {
			role = role.substring(3, role.length - 1);
			console.log(role);
		}

		const newRole =
			guild.roles.cache.find((r) => {
				return r.name === role || r.id === role;
			}) || null;

		if (!newRole) {
			message.reply(`Could not find a role for "${role}"`);
			return;
		}

		role = newRole;

		if (emoji.includes(":")) {
			const emojiName = emoji.split(":")[1];
			emoji = guild.emojis.cache.find((e) => {
				return e.name === emojiName;
			});
		}

		const [fetchedMessage] = fetchCache(guild.id);
		if (!fetchedMessage) {
			message.reply("An error occurred, please try again");
			return;
		}

		const newLine = `${emoji} ${displayName}`;
		let { content } = fetchedMessage;

		if (content.includes(emoji)) {
			const split = content.split("\n");

			for (let a = 0; a < split.length; ++a) {
				if (split[a].includes(emoji)) {
					split[a] = newLine;
				}
			}

			content = split.join("\n");
		} else {
			content += `\n${newLine}`;
			fetchedMessage.react(emoji);
		}

		fetchedMessage.edit(content);

		message.delete({
			timeout: 1000 * 10,
		});

		const obj = {
			guildId: guild.id,
			channelId: fetchedMessage.channel.id,
			messageId: fetchedMessage.id,
		};

		await reactionRolesSchema.findOneAndUpdate(
			obj,
			{
				...obj,
				$addToSet: {
					roles: {
						emoji,
						roleId: role.id,
					},
				},
			},
			{
				upsert: true,
			}
		);

		addToCache(guild.id, fetchedMessage, emoji, role.id);
	}
};
