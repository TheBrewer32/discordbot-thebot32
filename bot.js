const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const server = require("./server.js");
server.sendClient(client);
const algebra = require("algebra.js");
const http = require("http");
const { exec } = require("child_process");
const ytdl = require("ytdl-core");
const glob = require("glob");
const gitDownload = require("download-git-repo");
const validUrl = require("valid-url");

const streamOptions = { seek: 0, volume: 1 };

var serverToken = "thiswasasecretpassword";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  updateStatus();
});

function commandParser(_a) {
  var _o = {
    result: false,
    output: [""],
    isCmd: false
  };
  var strOpen = false;
  var strChar = "";
  for (var i = 0; i < _a.length; i++) {
    if (i == 0 && _a[i] == "~") {
      _o.isCmd = true;
      continue;
    }
    if (!strOpen && (_a[i] == '"' || _a[i] == "'")) {
      strChar = _a[i];
      strOpen = true;
      continue;
    }
    if (strOpen && _a[i] == strChar) {
      strOpen = false;
      continue;
    }
    if (!strOpen && _a[i] == " ") {
      _o.output.push("");
      continue;
    }
    _o.output[_o.output.length - 1] += _a[i];
  }
  if (!strOpen) _o.result = true;
  return _o;
}

function updateStatus() {
  client.user.setStatus(config.AboutMe.status.status);
  client.user.setActivity(config.AboutMe.status.activity, {
    type: config.AboutMe.status.presence.toUpperCase()
  });
}

client.on("message", async msg => {
  if(msg.author.bot)return;
  var cp = commandParser(msg.content);
  if (cp.isCmd) {
    var cmd = cp.output;
  } else {
    if(msg.content.trim().toLowerCase()=="hello") {
      msg.channel.send("Hello "+msg.member.displayName);
    }
  }
});

function playSong(vc, song) {
  vc.join().then(conn => {
    const stream = ytdl(`https://www.youtube.com/watch?v=${song}`, {
      filter: "audioonly"
    });
    const dispatcher = conn.playStream(stream, streamOptions);
    dispatcher.on("end", end => {
      vc.leave();
    });
  });
}

function speak(vc, text) {
  var filename = `${__dirname}/recordings/speech-${new Date().getTime()}.wav`;
  exec(`"${__dirname}/espeak/espeak" "${text}" -w "${filename}"`, err => {
    if (err) {
      console.log(err);
      client.guilds
        .get("584382438688555019")
        .channels.get("593476194209366017")
        .send(
          "<@&590198302918836240> __**Error speaking**__\n" +
            JSON.stringify(err)
        );
      return;
    }

    vc.join().then(conn => {
      const dispatcher = conn.playFile(filename);
      dispatcher.on("end", end => {
        vc.leave();
      });
    });
  });
}

client.on("error", err =>
  client.guilds
    .get("584382438688555019")
    .channels.get("593476194209366017")
    .send("<@&590198302918836240> __**Error**__\n" + JSON.stringify(err))
);
client.on("warn", err =>
  client.guilds
    .get("584382438688555019")
    .channels.get("593476194209366017")
    .send("<@&590198302918836240> __**Warn**__\n" + JSON.stringify(err))
);

client.login(process.env.TOKEN);