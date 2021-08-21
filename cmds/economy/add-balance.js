const Commando = require("discord.js-commando");
const economy = require("../../features/features/economy");

module.exports = class AddBalanceCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "addbalance",
			group: "economy",
			memberName: "addbalance",
			description: "Gives a user coins.",
			argsType: "multiple",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async run(message, args) {
		const mention = message.mentions.users.first();

		if (!mention) {
			message.reply("Please tag a user to add coins to.");
			return;
		}

		const coins = args[0];
		if (isNaN(coins)) {
			message.reply("Please provide a valid number of coins.");
			return;
		}

		const guildId = message.guild.id;
		const userId = mention.id;

		const newCoins = await economy.addCoins(guildId, userId, coins);

		message.reply(
			`You have given <@${userId}> ${coins} coin(s). They now have ${newCoins} coin(s)!`
		);
	}
};
