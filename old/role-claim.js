const firstMessage = require("../util/first-message");

module.exports = (client) => {
	const channelId = "847996473056428052";

	// getEmoji works for custom emoji
	const getEmoji = (emojiName) =>
		client.emojis.cache.find((emoji) => emoji.name === emojiName);

	const emojis = {
		"🌑": "Destiny 2",
		"🥜": "Apex Legends",
		"🌈": "R6: Siege",
		"🐉": "League of Legends",
		"🔫": "Valorant",
	};

	const reactions = [];

	let emojiText = `На сервере существуют роли по играм.
Получение роли дает доступ к каналам по интересующей игре.
Для получения роли отправьте соответствующую реакцию к данному сообщению.\n\n`;

	for (const key in emojis) {
		//const emoji = getEmoji(key);
		const emoji = key;
		reactions.push(emoji);

		//console.log(emoji);
		const role = emojis[key];
		emojiText += `${emoji} = ${role}\n`;
	}

	firstMessage(client, channelId, emojiText, reactions);

	const handleReaction = (reaction, user, add) => {
		if (user.id === "847999444284866601") return;

		const emoji = reaction._emoji.name;

		const { guild } = reaction.message;

		const roleName = emojis[emoji];
		if (!roleName) {
			return;
		}

		const role = guild.roles.cache.find((role) => role.name === roleName);
		const member = guild.members.cache.find((member) => member.id === user.id);

		if (add) {
			member.roles.add(role);
		} else {
			member.roles.remove(role);
		}
	};

	client.on("messageReactionAdd", (reaction, user) => {
		if (reaction.message.channel.id === channelId) {
			handleReaction(reaction, user, true);
		}
	});

	client.on("messageReactionRemove", (reaction, user) => {
		if (reaction.message.channel.id === channelId) {
			handleReaction(reaction, user, false);
		}
	});
};
