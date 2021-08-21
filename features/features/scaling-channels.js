let channelName = null;
let prevChannelName = null;
const dontScale = ["AFK", "Для модеров"];

// TODO Сделать рефакторинг функции
const getVoiceChannels = (guild, channelCompare = channelName) => {
	return guild.channels.cache.filter((channel) => {
		//console.log(`${channel.name} - ${channel.members.size}`);
		return (
			channel.type === "voice" &&
			channel.name === channelCompare &&
			channel.members.size === 0
		);
	});
};

// TODO Сделать функцию удаления каналов
const deleteChannel = () => {};

module.exports = (client) => {
	// TODO Оптимизировать код
	client.on("voiceStateUpdate", (oldState, newState) => {
		const { guild } = oldState;
		const joined = !!newState.channelID;
		const relocated = !!oldState.channelID;

		const channelId = joined ? newState.channelID : oldState.channelID;
		let channel = guild.channels.cache.get(channelId);

		if (relocated) {
			const prevChannel = guild.channels.cache.get(oldState.channelID);
			prevChannelName = prevChannel.name;
		}
		channelName = channel.name;

		// console.log(
		// 	`${newState.channelID} (${channel.name}) vs ${oldState.channelID} (${prevChannelName})`
		// );

		if (!dontScale.includes(channel.name)) {
			if (joined) {
				const channels = getVoiceChannels(guild);
				if (relocated && channelName !== prevChannelName) {
					console.log("relocated to other channel");
					const prevChannel = guild.channels.cache.get(oldState.channelID);
					const channelsOld = getVoiceChannels(guild, prevChannelName);
					if (channelsOld.size > 1 && prevChannel.members.size === 0) {
						prevChannel.delete();
					}
				} else if (relocated && channelName === prevChannelName) {
					console.log("relocated to same channel");
					const prevChannel = guild.channels.cache.get(oldState.channelID);
					const channelsOld = getVoiceChannels(guild, prevChannelName);
					channelsOld.forEach((channel) =>
						console.log(`${channel.name} - ${channel.members.size}`)
					);
					if (channelsOld.size > 1 && prevChannel.members.size === 0) {
						prevChannel.delete();
					}
				} else {
					console.log("joined channel");
				}

				let hasEmpty = false;

				channels.forEach((channel) => {
					if (!hasEmpty && channel.members.size === 0) {
						hasEmpty = true;
					}
				});

				if (!hasEmpty) {
					const {
						type,
						userLimit,
						bitrate,
						parentID,
						permissionOverwrites,
						rawPosition,
					} = channel;

					guild.channels.create(channelName, {
						type,
						bitrate,
						userLimit,
						parent: parentID,
						permissionOverwrites,
						position: rawPosition,
					});
				}
			} else if (
				channel.members.size === 0 &&
				getVoiceChannels(guild).size > 1
			) {
				console.log("leave channel");
				channel.delete();
			}
		} else if (relocated) {
			console.log("relocate to noscale channel");
			channel = guild.channels.cache.get(oldState.channelID);
			if (
				channel.members.size === 0 &&
				getVoiceChannels(guild, prevChannelName).size > 1
			) {
				channel.delete();
			}
		}
	});
};
