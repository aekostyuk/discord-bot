const path = require("path");
const { MongoClient } = require("mongodb");
const { MongoDBProvider } = require("commando-provider-mongo");
const Commando = require("discord.js-commando");

const token = process.env.token;
const prefix = process.env.prefix;
const mongoPath = process.env.mongoPath;
const mongo = require("./util/mongo");

const loadFeatures = require("./features/load-features");

const client = new Commando.CommandoClient({
	owner: "321263256226496512",
	commandPrefix: prefix,
});

client.setProvider(
	MongoClient.connect(mongoPath, {
		useUnifiedTopology: true,
	})
		.then((client) => {
			return new MongoDBProvider(client, "discord-bot");
		})
		.catch((err) => {
			console.error(err);
		})
);

client.on("ready", async () => {
	console.log("The client is ready!");

	try {
		await mongo();

		client.registry
			.registerGroups([
				["misc", "misc commands"],
				//["moderation", "moderation commands"],
				["economy", "Commands for the economy system"],
				["reactions", "Commands to handle roles reactions"],
				["thanks", "Commands to help thank people"],
			])
			.registerDefaults()
			.registerCommandsIn(path.join(__dirname, "cmds"));

		loadFeatures(client);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
});

client.login(token);
