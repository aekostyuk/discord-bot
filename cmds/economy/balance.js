const Commando = require("discord.js-commando");
const economy = require("../../features/features/economy");

module.exports = class BalanceCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "balance",
			group: "economy",
			memberName: "balance",
			description: "Displays a user's coins.",
		});
	}

	async run(message, args) {
		const target = message.mentions.users.first() || message.author;
		const targetId = target.id;

		const guildId = message.guild.id;
		const userId = target.id;

		const coins = await economy.getCoins(guildId, userId);

		message.reply(`That user has ${coins} coins!`);
	}
};
