const Commando = require("discord.js-commando");
const dailyRewardsSchema = require("../../schemas/daily-rewards-schema");
const economy = require("../../features/features/economy");

// Array of member IDs who have claimed their daily rewards in the last 24 hours
// Resets every 10 minutes
let claimedCache = [];

const clearCache = () => {
	claimedCache = [];
	setTimeout(clearCache, 1000 * 60 * 10); // 10 minutes
};
clearCache();

const alreadyClaimed = "You have already claimed your daily rewards";

module.exports = class DailyCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: "daily",
			group: "economy",
			memberName: "daily",
			description: "Claims daily rewards.",
		});
	}

	async run(message) {
		const { guild, member } = message;
		const { id } = member;

		if (claimedCache.includes(id)) {
			console.log("Returning from cache");
			message.reply(alreadyClaimed);
			return;
		}

		console.log("Fetching from mongo");

		const obj = {
			guildId: guild.id,
			userId: id,
		};

		const results = await dailyRewardsSchema.findOne(obj);

		console.log("RESULTS:", results);

		if (results) {
			const then = {};
			const now = {};
			// const then = new Date(results.updatedAt).getTime();
			// const now = new Date().getTime();

			// const diffTime = Math.abs(now - then);
			// const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

			// const hours = 24;
			// console.log(diffHours);

			then.year = new Date(results.updatedAt).getFullYear();
			then.month = new Date(results.updatedAt).getMonth();
			then.day = new Date(results.updatedAt).getDate();
			now.year = new Date().getFullYear();
			now.month = new Date().getMonth();
			now.day = new Date().getDate();

			// if (diffHours < hours) {
			// 	claimedCache.push(id);

			// 	message.reply(alreadyClaimed);
			// 	return;
			// }

			if (
				then.year === now.year &&
				then.month === now.month &&
				then.day === now.day
			) {
				claimedCache.push(id);

				message.reply(alreadyClaimed);
				return;
			}
		}

		await dailyRewardsSchema.findOneAndUpdate(obj, obj, {
			upsert: true,
		});

		claimedCache.push(id);

		// TODO: Give the rewards
		const coins = 100;

		await economy.addCoins(guild.id, id, coins);

		message.reply("You have claimed your daily rewards!");
	}
};
