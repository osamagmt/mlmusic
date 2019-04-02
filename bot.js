const Discord = require('discord.js');
const { Client, Util } = require('discord.js');
const client = new Discord.Client();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

let prefix = '☆';
const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./config1');

const youtube = new YouTube(GOOGLE_API_KEY);


client.on('ready', () => {
    console.log('I am ready!');
});




const queue = new Map();



client.on('warn', console.warn);



client.on('error', console.error);



client.on('ready', () => console.log('Yo this ready!'));



client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));



client.on('reconnecting', () => console.log('I am reconnecting now!'));


client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	var embed = new Discord.RichEmbed()
	if (!msg.content.startsWith(PREFIX)) return undefined;



	const args = msg.content.split(' ');

	const searchString = args.slice(1).join(' ');

	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';

	const serverQueue = queue.get(msg.guild.id);



	let command = msg.content.toLowerCase().split(" ")[0];

	command = command.slice(PREFIX.length)

	if (command === `play`,`p`,`شغل`) {
    
		const voiceChannel = msg.member.voiceChannel;
        
		if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');

		const permissions = voiceChannel.permissionsFor(msg.client.user);

		if (!permissions.has('CONNECT')) {

			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');

		}

		if (!permissions.has('SPEAK')) {

			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');

		}



		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

			const playlist = await youtube.getPlaylist(url);

			const videos = await playlist.getVideos();

			for (const video of Object.values(videos)) {

				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop

				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop

			}

			return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);

		} else {

			try {

				var video = await youtube.getVideo(url);

			} catch (error) {

				try {

					var videos = await youtube.searchVideos(searchString, 10);

					let index = 0;

					const embed1 = new Discord.RichEmbed()
			        .setDescription(`**اختار رقم المقطع** :
${videos.map(video2 => `[**${++index} **] \`${video2.title}\``).join('\n')}`)
					.setFooter("")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					// eslint-disable-next-line max-depth


					// eslint-disable-next-line max-depth

					try {

						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {

							maxMatches: 1,

							time: 10000,

							errors: ['time']

						});

					} catch (err) {

						console.error(err);

						return msg.channel.send('No or invalid value entered, cancelling video selection.');

					}

					const videoIndex = parseInt(response.first().content);

					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);

				} catch (err) {

					console.error(err);

					return msg.channel.send('🆘 I could not obtain any search results.');

				}

			}

			return handleVideo(video, msg, voiceChannel);

		}
    
	} else if (command === `skip`) {

		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');

		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');

		serverQueue.connection.dispatcher.end('Skip command has been used!');

		return undefined;

	} else if (command === `stop`) {

		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');

		if (!serverQueue) return msg.channel.send('There is nothing playing that I could stop for you.');

		serverQueue.songs = [];

		serverQueue.connection.dispatcher.end('Stop command has been used!');

		return undefined;

	} else if(mess.startsWith(prefix + 'v','vol','volume')) {
if (!VIP.includes(message.author.id)) return;
if (!message.member.voiceChannel) return message.channel.send(':no_entry: **You need to be in the same voice channel to use this command**');
if (args > 100) return message.channel.send('***Volume : 1 / 100***');
if (args < 1) return message.channel.send('***Volume : 1 / 100***');
dispatcher.setVolume(1 * args / 50);
message.channel.sendMessage(`**#** \`Volume ${dispatcher.volume*50} %\` :ok_hand::skin-tone-2: `);
	} else if (command === `np`) {

		if (!serverQueue) return msg.channel.send('There is nothing playing.');

		return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);

	} else if (command === `queue`) {

		if (!serverQueue) return msg.channel.send('There is nothing playing.');

		return msg.channel.send(`
__**Song queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
		`);

	} else if (command === `pause`,`وقف`) {

		if (serverQueue && serverQueue.playing) {

			serverQueue.playing = false;

			serverQueue.connection.dispatcher.pause();

			return msg.channel.send('⏸ Paused the music for you!');

		}

		return msg.channel.send('There is nothing playing.');

	} else if (command === `resume`) {

		if (serverQueue && !serverQueue.playing) {

			serverQueue.playing = true;

			serverQueue.connection.dispatcher.resume();

			return msg.channel.send('▶ Resumed the music for you!');

		}

		return msg.channel.send('There is nothing playing.');

	}



	return undefined;

});


async function handleVideo(video, msg, voiceChannel, playlist = false) {

	const serverQueue = queue.get(msg.guild.id);

	console.log(video);

	const song = {

		id: video.id,

		title: Util.escapeMarkdown(video.title),

		url: `https://www.youtube.com/watch?v=${video.id}`

	};

	if (!serverQueue) {

		const queueConstruct = {

			textChannel: msg.channel,

			voiceChannel: voiceChannel,

			connection: null,

			songs: [],

			volume: 5,

			playing: true

		};

		queue.set(msg.guild.id, queueConstruct);



		queueConstruct.songs.push(song);



		try {

			var connection = await voiceChannel.join();

			queueConstruct.connection = connection;

			play(msg.guild, queueConstruct.songs[0]);

		} catch (error) {

			console.error(`I could not join the voice channel: ${error}`);

			queue.delete(msg.guild.id);

			return msg.channel.send(`I could not join the voice channel: ${error}`);

		}

	} else {

		serverQueue.songs.push(song);

		console.log(serverQueue.songs);

		if (playlist) return undefined;

		else return msg.channel.send(`✅ **${song.title}** has been added to the queue!`);

	}

	return undefined;

}



function play(guild, song) {

	const serverQueue = queue.get(guild.id);



	if (!song) {

		serverQueue.voiceChannel.leave();

		queue.delete(guild.id);

		return;

	}

	console.log(serverQueue.songs);



	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))

		.on('end', reason => {

			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');

			else console.log(reason);

			serverQueue.songs.shift();

			play(guild, serverQueue.songs[0]);

		})

		.on('error', error => console.error(error));

	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);



	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);

}



client.on('message', message => {
    if (message.content === 'ping') {
    	message.channel.send('PONG!');
  	}
});


const VIP = ["440081527909515265","460976885036220426",""]

const adminprefix = "☆";
client.on('message', message => {
    var argresult = message.content.split(` `).slice(1).join(' ');
      if (!VIP.includes(message.author.id)) return;
      
  if (message.content.startsWith(adminprefix + 'ply')) {
    client.user.setGame(argresult);
      message.channel.sendMessage(`**:white_check_mark:   ${argresult}**`)
  } else 
    if (message.content === (adminprefix + "Percie")) {
    message.guild.leave();        
  } else  
  if (message.content.startsWith(adminprefix + 'wt')) {
  client.user.setActivity(argresult, {type:'WATCHING'});
      message.channel.sendMessage(`**:white_check_mark:   ${argresult}**`)
  } else 
  if (message.content.startsWith(adminprefix + 'ls')) {
  client.user.setActivity(argresult , {type:'LISTENING'});
      message.channel.sendMessage(`**:white_check_mark:   ${argresult}**`)
  } else     
    if (message.content.startsWith(adminprefix + 'setname')) {
  client.user.setUsername(argresult).then
      message.channel.sendMessage(`**${argresult}** : Done :>`)
  return message.reply("**You Can't Change Your Name ,Only After Two Hours :>**");
  } else
    if (message.content.startsWith(adminprefix + 'setavatar')) {
  client.user.setAvatar(argresult);
    message.channel.sendMessage(`**${argresult}** : تم تغير صورة البوت`);
        } else     
  if (message.content.startsWith(adminprefix + 'st')) {
    client.user.setGame(argresult, "https://www.twitch.tv/osama_gmt");
      message.channel.sendMessage(`**:white_check_mark:   ${argresult}**`)
  }});

client.on('message', message => {
if (message.content.startsWith(prefix + 'help','مساعدة')) {
	if (!VIP.includes(message.author.id)) return;
	if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(300));
	let embed = new Discord.RichEmbed()
 .setAuthor(`${message.author.tag}`, message.author.avatarURL)
 .addField("**:musical_note:  اوامر الميوزك**","** **")
 .addField(`**${prefix}play**`,"**لـ تشغيل لاغنيه**")
 .addField(`**${prefix}vol**`,"**لرفع صوت لاغنيه**")
 .addField(`**${prefix}stop**`,"**لـ اطفاء لاغنيه**")
 .addField(`**${prefix}skip**`,"**لـ نخطي لاغنيه**")
 .addField(`**${prefix}leave**`,"**لـ طرد البوت من الروم**")
 .addField(`**${prefix}pause**`,"**لـ ايفاف الاغنية**")
 .addField(`**${prefix}resume**`,"**لـ موآصلة الإغنية بعد إيقآفهآ مؤقتانيه**")
 .setColor('RANDOM')
	message.channel.sendEmbed(embed).then(m => m.delete(25000));
}
});

client.on('message', message => {
if (message.content.startsWith(prefix + 'admin','ادارة')) {
	if (!VIP.includes(message.author.id)) return;
	if(!message.channel.guild) return message.reply('**هذا الأمر للسيرفرات فقط**').then(m => m.delete(300));
	let embed = new Discord.RichEmbed()
 .setAuthor(`${message.author.tag}`, message.author.avatarURL)
 .addField("**:musical_note:  اوامر الميوزك**","** **")
 .addField(`**${prefix}wt**`,"**لـ تغيير الواتشنق للبوت**")
 .addField(`**${prefix}ls**`,"**لـ تغيير الليستنف للبوت**")
 .addField(`**${prefix}st**`,"**لـ تغيير التسريمنق للبوت**")
 .addField(`**${prefix}ply**`,"**لـ تغيير البلاينق للبوت**")
 .addField(`**${prefix}setname**`,"**لـ تغيير اسم البوت**")
 .addField(`**${prefix}setavatar**`,"**لـ تغيير صورة البوت**")
 .addField(`**${prefix}Percie**`,"**لـ طرد البوت من سيرفر**")
 .setColor('RANDOM')
	message.channel.sendEmbed(embed).then(m => m.delete(25000));
}
});


client.login(process.env.BOT_TOKEN);
