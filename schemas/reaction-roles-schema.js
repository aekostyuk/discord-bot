const mongoose = require("mongoose");

const reqString = {
	type: String,
	required: true,
};

const reactionRolesSchema = new mongoose.Schema({
	guildId: reqString,
	channelId: reqString,
	messageId: reqString,
	roles: [
		{
			emoji: reqString,
			roleId: reqString,
		},
	],
});

module.exports = mongoose.model("reaction-roles", reactionRolesSchema);
