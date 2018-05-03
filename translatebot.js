const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const translate = require("google-translate-api");
const langmap = require("./langmap.json");

// :t
bot.on("message", msg => {
  let prefix = ":";
  if(!msg.content.startsWith(prefix)) return;
  if(msg.author.bot) return;
  if(msg.type === 'dm') return;
  if(static_ban_list.includes(msg.author.id)) {
    // msg.author.sendMessage("You are banned from using this bot.");
    console.log("BANNED USER: " + msg.author.username + msg.author + " tried to use bot.");
    return;
  };

  // parse the json ban list and ban appropriately
  jsonContent = JSON.parse(fs.readFileSync('./banned.json', 'utf8')); // parse the json ban list
  if(jsonContent.hasOwnProperty(msg.author.id)) {
    console.log("BANNED USER: " + msg.author.username + msg.author + " tried to use bot.");
    return;
  }
  if (check_recently_used_command(msg.author)) {
    console.log("USER HAS BEEN BANNED: " + msg.author.username + msg.author);
    msg.channel.sendMessage ("```Stop sending so many commands!```");
    return;
  }

  if (msg.content.startsWith(prefix + "t")) {
    var args = msg.content.slice(prefix.length).trim().split(/ +/g); // splits up every thing into spaces
    var command = args.shift().toString().toLowerCase(); // get the command
    var lang = args.shift().toString().toLowerCase(); // get the lang

    let thingToTranslate = args.join(" ");
    if (thingToTranslate == "" || thingToTranslate == null || thingToTranslate == undefined) return msg.channel.send("\`\`\`Nothing to translate!\`\`\`");

    for (let l in langmap) {
      for (let a in langmap[l].alias) {
        // console.log(`Lang Alias: ` + langmap[l].alias[a]);
        if (langmap[l].alias[a] == lang) {
          translate(thingToTranslate, {from: 'auto', to: l}) .then(res => {
            // msg.channel.send(res.text);
            // send our embed
            var embed = new Discord.RichEmbed()
              .setTitle(`:flag_${langmap[l].flag}: ` + msg.author.username + ` :flag_${langmap[l].flag}:`)
              .setColor(0x00AE86)
              .setDescription(res.text)

            msg.channel.send({embed})
              .catch(err => console.log(err));
          })
          .catch(err => {
            console.error(err);
          });
        }
      }
    }

  }
});

// static ban list (old)
const static_ban_list =
["USERIDHERE"]; // ban list end

// array to check recently used command users
var recently_used_command = [];

// random image
var imageTrackerArray = []; // an array to track images we've already posted so we don't repost

// clear recently used command array
setInterval(function() { return recently_used_command = [] }, 5000);

var check_recently_used_command = function (user) {
  var dataset = recently_used_command;
  var search = user.id;
  var occurances = dataset.filter(function(val){
  return val === search;
  }).length;
  // console.log(occurances);
  if (occurances > 4) {
    jsonContent = JSON.parse(fs.readFileSync('./banned.json', 'utf8')); // parse the json ban list
    jsonContent[user.id] = user.username;
    fs.writeFileSync("banned.json", JSON.stringify(jsonContent,null, 2));
    return true;
  } else {
    return false;
  }
};


// im ready
bot.on('ready', () => {
 console.log('Translate bot, ready!');
});


bot.login("TOKEN GOES HERE");
