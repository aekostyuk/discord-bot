const Discord = require("discord.js");
const client = new Discord.Client();
const { token } = require("../config.json");

const loadCommands = require("../commands(old)/load-commands");
const loadFeatures = require("../features/load-features");

client.on("ready", async () => {
	console.log("The client is ready");

	loadCommands(client);
	loadFeatures(client);
});

client.login(token);
