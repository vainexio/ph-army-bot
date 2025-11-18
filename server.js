// Project
const express = require("express");
const app = express();
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cc = 'KJ0UUFNHWBJSE-WE4GFT-W4VG'
app.use(bodyParser.json());

// Discord
const Discord = require("discord.js");
const { WebhookClient, Permissions, Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = Discord;
const myIntents = new Intents();
myIntents.add(
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES
);
const client = new Client({ intents: myIntents, partials: ["CHANNEL"] });

// Secrets
const token = process.env.SECRET;
const mongooseToken = process.env.MONGOOSE;

// Models
let usersSchema
let users

// Codes
const codesByCode = new Map();      // code -> { discordId, expiresAt }
const codeByDiscord = new Map();    // discordId -> code

// Config
const CODE_TTL_MS = 5 * 60 * 1000; // 10 minutes default (change as needed)
const VERIFY_SECRET = process.env.VERIFY_SECRET || null; // optional header secret for /verify
let stopFlow = false

// Utility: generate a 6-digit string, ensure uniqueness in codesByCode
function generate6DigitCode() {
  // try up to a few times to avoid collision
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    if (!codesByCode.has(code)) return code;
  }
  // fallback: extremely unlikely to happen, but if it does, linear scan
  let candidate = 100000;
  while (codesByCode.has(String(candidate))) candidate++;
  return String(candidate);
}

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of codesByCode.entries()) {
    if (entry.expiresAt <= now) {
      codesByCode.delete(code);
      codeByDiscord.delete(entry.discordId);
    }
  }
}, 60 * 1000);

async function startApp() {
  console.log("Starting...");
  if (client.user) return console.log("User already logged in.")
  if (cc !== process.env.CC) return console.error("Discord bot login | Invalid CC");
  let promise = client.login(token)

  promise?.catch(function(error) {
    console.error("Discord bot login | " + error);
    process.exit(1);
  });
}
startApp();

client.on("debug", async function(info) {
  let status = info.split(" ");
  if (status[2] === `429`) {
    console.log(`info -> ${info}`);
    console.log(`Caught a 429 error!`);
    await sleep(60000)
  }
});

// Initializer
client.on("ready", async () => {
  console.log(client.user.id)
  await mongoose.connect(mongooseToken);

  usersSchema = new mongoose.Schema({
    robloxId: { type: String, unique: true, sparse: true },
    xp: { type: Number, default: 0 },
    merit: { type: Number, default: 0 },
  });

  users = mongoose.model("PA_Users1", usersSchema);

  if (slashCmd.register) {
    let discordUrl = "https://discord.com/api/v10/applications/" + client.user.id + "/commands"
    let headers = {
      "Authorization": "Bot " + token,
      "Content-Type": 'application/json'
    }
    for (let i in slashes) {
      await sleep(2000)
      let json = slashes[i]
      let response = await fetch(discordUrl, {
        method: 'post',
        body: JSON.stringify(json),
        headers: headers
      });
      console.log(json.name + ' - ' + response.status)
    }
    for (let i in slashCmd.deleteSlashes) {
      await sleep(2000)
      let deleteUrl = "https://discord.com/api/v10/applications/" + client.user.id + "/commands/" + slashCmd.deleteSlashes[i]
      let deleteRes = await fetch(deleteUrl, {
        method: 'delete',
        headers: headers
      })
      console.log('Delete - ' + deleteRes.status)
    }
  }

  console.log("Successfully logged in to discord bot.");
  client.user.setPresence(config.bot.status);
});

module.exports = { client: client, getPerms, noPerms };

let listener = app.listen(process.env.PORT, function() {
  console.log("Not that it matters but your app is listening on port ", listener.address());
});

//Settings
const settings = require("./storage/settings_.js");
const { prefix, config, colors, theme, commands, permissions, emojis } = settings;
//Functions
const get = require("./functions/get.js");
const { getNth, getChannel, getGuild, getUser, getMember, getRandom, getColor } = get;
//Command Handler
const cmdHandler = require("./functions/commands.js");
const { checkCommand, isCommand, isMessage, getTemplate } = cmdHandler;
//Others
const others = require("./functions/others.js");
const { makeCode, fetchKey, ghostPing, sleep, moderate, getPercentageBar, randomTable, scanString, requireArgs, getArgs } = others;
//Roles Handler
const roles = require("./functions/roles.js");
const { getRole, addRole, removeRole, hasRole } = roles;
//Slash Commands
const slashCmd = require("./storage/slashCommands.js");
const { slashes } = slashCmd;
// Roblox
const robloxJs = require("./functions/roblox.js");
const { handler } = robloxJs;
/*
██████╗░███████╗██████╗░███╗░░░███╗░██████╗
██╔══██╗██╔════╝██╔══██╗████╗░████║██╔════╝
██████╔╝█████╗░░██████╔╝██╔████╔██║╚█████╗░
██╔═══╝░██╔══╝░░██╔══██╗██║╚██╔╝██║░╚═══██╗
██║░░░░░███████╗██║░░██║██║░╚═╝░██║██████╔╝
╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═════╝░*/
async function getPerms(member, level) {
  let highestPerms = null;
  let highestLevel = 0;
  let sortedPerms = await permissions.sort((a, b) => b.level - a.level);
  for (let i in sortedPerms) {
    if (permissions[i].id === member.id && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? ((highestPerms = permissions[i]), (highestLevel = permissions[i].level)) : null;
    } else if (member.user && member.roles.cache.some((role) => role.id === permissions[i].id) && permissions[i].level >= level) {
      highestLevel < permissions[i].level ? ((highestPerms = permissions[i]), (highestLevel = permissions[i].level)) : null;
    }
  }

  if (highestPerms) return highestPerms;
}
async function guildPerms(message, perms) {
  //console.log(Permissions.FLAGS)
  if (message.member.permissions.has(perms)) return true

  let embed = new MessageEmbed()
    .addFields({ name: "Insufficient Permissions", value: "You don't have the required server permissions to use this command.\n\n`" + perms.toString().toUpperCase() + "`" })
    .setColor(colors.red);

  message.channel.send({ embeds: [embed] });
}
function noPerms() {
  let Embed = new MessageEmbed()
    .setColor(colors.red)
    .setDescription("You lack special permissions to use this command.");
  return Embed;
}

/*
░█████╗░██╗░░░░░██╗███████╗███╗░░██╗████████╗  ███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗
██╔══██╗██║░░░░░██║██╔════╝████╗░██║╚══██╔══╝  ████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝
██║░░╚═╝██║░░░░░██║█████╗░░██╔██╗██║░░░██║░░░  ██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░
██║░░██╗██║░░░░░██║██╔══╝░░██║╚████║░░░██║░░░  ██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░
╚█████╔╝███████╗██║███████╗██║░╚███║░░░██║░░░  ██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗
░╚════╝░╚══════╝╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝*/
//ON CLIENT MESSAGE
client.on("messageCreate", async (message) => {
  //
  if (message.author.bot) return;
  if (stopFlow) return;
  if (message.content == "killdis") {
    if (!await getPerms(message.member, 5)) return;
    stopFlow = true
  }
}); //END MESSAGE CREATE

//

client.on("interactionCreate", async (inter) => {
  if (stopFlow) return;
  if (inter.isCommand()) {
    let cname = inter.commandName

    if (cname === 'setrank') {
      if (!await getPerms(inter.member, 4)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });

      const options = inter.options._hoistedOptions;
      const usernameOpt = options.find(a => a.name === 'user');
      const rankOpt = options.find(a => a.name === 'rank');
      const group = config.groups[1];
      const groupId = group.groupId;

      if (!usernameOpt || !rankOpt) {
        return inter.reply({ content: emojis.warning + ' Missing required options.', ephemeral: true });
      }

      await inter.deferReply();

      // small helper to send failure and stop
      const fail = async (msg) => inter.editReply({ content: msg });

      try {
        const rawInput = String(usernameOpt.value).trim();

        // Detect Discord mention <@!id> or raw ID (17-20 digits)
        const mentionMatch = rawInput.match(/^<@!?(\d+)>$/);
        const rawDiscordIdMatch = !mentionMatch && rawInput.match(/^(\d{17,20})$/);

        let robloxUser; // will hold Roblox user object { id, name, displayName, ... }
        let dbUserRecord; // DB record for the linked robloxId (if any)

        if (mentionMatch || rawDiscordIdMatch) {
          // Resolve Discord user object using your existing getUser
          const discordIdentifier = mentionMatch ? mentionMatch[0] : rawDiscordIdMatch[1];
          const discordObj = await getUser(discordIdentifier);
          if (!discordObj || discordObj.error) {
            return fail('```diff\n- Failed to resolve the Discord user.```');
          }

          // Find linked robloxId in DB
          dbUserRecord = await users.findOne({ discordId: String(discordObj.id) }).exec();
          if (!dbUserRecord) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1413166977555365969> command to link the account.");
          }

          // Get Roblox user by stored robloxId
          robloxUser = await handler.getUser(String(dbUserRecord.robloxId));
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");
        } else {
          // Treat input as Roblox username or id
          robloxUser = await handler.getUser(rawInput);
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          // Get or create DB record for this roblox user
          dbUserRecord = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
          if (!dbUserRecord) {
            dbUserRecord = await users.create({ robloxId: String(robloxUser.id), xp: 0 });
          }
        }

        // Get the user's current role in the group
        const currentRoleRes = await handler.getUserRole(groupId, robloxUser.id);
        if (currentRoleRes.error) {
          return fail(emojis.warning + " **" + (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")** is not in the group.");
        }

        const currentRole = currentRoleRes; // expecting { id, name, rank, ... }

        // Fetch group roles and find the target role by name (case-insensitive substring)
        const groupRolesRes = await handler.getGroupRoles(groupId);
        if (!groupRolesRes || groupRolesRes.error) {
          return fail(emojis.warning + " Failed to fetch group roles. Try again later.");
        }

        const targetRole = (groupRolesRes.roles || []).find(r =>
          String(r.name).toLowerCase().includes(String(rankOpt.value).toLowerCase())
        );

        if (!targetRole) {
          return fail(`Rank does not exist: ${rankOpt.value}`);
        }
        console.log(targetRole, robloxUser, groupId)

        // Attempt to change rank
        const updateRank = await handler.changeUserRank({ groupId: groupId, userId: robloxUser.id, roleId: targetRole.id });

        if (!updateRank || updateRank.status !== 200) {
          console.log(updateRank)
          const statusText = updateRank?.statusText || (updateRank?.error ?? 'Unknown error');
          return fail(emojis.warning + " Cannot change rank:\n```diff\n- " + updateRank.status + ": " + statusText + "```");
        }

        // Build response embed
        const thumbnail = await handler.getUserThumbnail(robloxUser.id);

        const embed = new MessageEmbed()
          .setThumbnail(thumbnail)
          .setFooter({ text: "User ID: " + robloxUser.id })
          .setColor(colors.green)
          .addFields(
            { name: "User", value: (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")" },
            { name: "Updated Rank", value: `\`\`\`diff\n+ ${targetRole.name}\`\`\`` },
            { name: "Previous Rank", value: `\`\`\`diff\n- ${currentRole.name}\`\`\`` }
          );

        await inter.editReply({ content: emojis.check + ' Rank Updated', embeds: [embed] });

        // Audit logging
        let logs = await getChannel(config.channels.logs)
        let logEmbed = new MessageEmbed(embed)
          .setDescription(inter.user.toString() + " used `/setrank` command.")
        await logs.send({ embeds: [logEmbed] });

      } catch (err) {
        console.error('setrank handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }
    else if (cname === 'points') {
      if (!await getPerms(inter.member, 3)) return inter.reply({ content: emojis.warning + ' Insufficient Permission' });

      const options = inter.options._hoistedOptions;
      const type = options.find(a => a.name === 'type');
      const usernameOption = options.find(a => a.name === 'usernames'); // comma separated
      const amount = options.find(a => a.name === 'amount');

      await inter.reply({ content: "-# " + emojis.loading });

      const usernames = String(usernameOption?.value || "")
        .split(',')
        .map(u => u.trim())
        .filter(Boolean);

      const meritsToChange = parseInt(amount?.value, 10);
      if (isNaN(meritsToChange) || meritsToChange < 0) {
        return await inter.editReply({ content: emojis.warning + " Invalid amount." });
      }

      const action = String(type?.value || "").toLowerCase(); // add / subtract

      let processedCount = 0;
      let awardedList = []; // strings like "**@name**: Medal A, Medal B"
      let failedList = [];

      const group = config.groups[1];
      const groupId = group.groupId;

      for (const unameRaw of usernames) {
        let uname = String(unameRaw).trim();
        try {
          // resolve mention or discord id
          const mentionMatch = uname.match(/^<@!?(\d+)>$/);
          const rawIdMatch = !mentionMatch && uname.match(/^(\d{17,20})$/);

          let user; // roblox user obj
          let dbUser;

          if (mentionMatch || rawIdMatch) {
            const discordIdentifier = mentionMatch ? mentionMatch[0] : rawIdMatch[1];
            const discordObj = await getMember(discordIdentifier,inter.guild);
            if (discordObj.nickname) {
              uname = discordObj.nickname.split(" ")[1]
            } else {
              continue;
            }
          }
          
          user = await handler.getUser(uname);
          if (user.error) {
            await inter.channel.send({ content: emojis.warning + ` Failed to fetch Roblox user \`${uname}\`: ${user.error}` });
            failedList.push(uname);
            continue;
          }
          dbUser = await users.findOne({ robloxId: String(user.id) }).exec();
          if (!dbUser) dbUser = await users.create({ robloxId: String(user.id), xp: 0, merit: 0 });


          if (!user || !user.id) {
            await inter.channel.send({ content: emojis.warning + ` Could not resolve Roblox user for input \`${uname}\`.` });
            failedList.push(uname);
            continue;
          }

          const userRole = await handler.getUserRole(groupId, user.id);
          if (userRole.error) {
            await inter.channel.send({ content: emojis.warning + ` **${user.displayName ?? user.name} (@${user.name})** is not in the group.` });
            failedList.push(uname);
            continue;
          }
          
          const prevMerit = Number(dbUser.merit ?? 0);
          let newMerit = prevMerit;
          if (action === 'add' || action === 'a') {
            newMerit = prevMerit + meritsToChange;
          } else if (action === 'subtract' || action === 'sub' || action === 's') {
            newMerit = prevMerit - meritsToChange;
            if (newMerit < 0) newMerit = 0;
          } else {
            await inter.channel.send({ content: emojis.warning + ` Invalid type for **${user.name}**. Use Add or Subtract.` });
            failedList.push(uname);
            continue;
          }

          dbUser.merit = newMerit;
          await dbUser.save();

          // Determine newly crossed awards using config.awards ORDER (no sorting)
          const awards = Array.isArray(config.awards) ? config.awards : [];
          const newlyAwarded = [];
          for (const award of awards) {
            const req = parseInt(award.requiredMerits || award.requiredMerit || 0, 10) || 0;
            if (prevMerit < req && newMerit >= req) {
              newlyAwarded.push(award.awardName || award.name || `Award(${req})`);
            }
          }

          if (newlyAwarded.length) {
            awardedList.push(`**@${user.name}**: ${newlyAwarded.join(', ')}`);
          }

          // notify in channel
          const thumbnail = await handler.getUserThumbnail(user.id);
          const emojiState = (action === 'add' || action === 'a') ? emojis.green : emojis.red;

          const embed = new MessageEmbed()
            .setThumbnail(thumbnail)
            .setColor((action === 'add' || action === 'a') ? colors.green : colors.red)
            .setDescription(`${emojiState} ${action === 'add' ? 'Added' : 'Subtracted'} **${meritsToChange} Merit(s)** to ${user.displayName} (@${user.name})`)
            .setFooter({ text: "User ID: " + user.id })
            .addFields(
              { name: "Army Rank", value: userRole.name || ("Rank " + (userRole.rank ?? "Unknown")) },
              { name: "Merit Total", value: `${dbUser.merit} Merit(s)` }
            );

          await inter.channel.send({ embeds: [embed] });

          if (newlyAwarded.length) {
            await inter.channel.send({ content: emojis.check + ` New medal(s) for **@${user.name}**: ${newlyAwarded.join(', ')}` });
          }

          processedCount++;
        } catch (err) {
          console.error('Error processing merit target:', uname, err);
          await inter.channel.send({ content: emojis.warning + ` Error processing \`${uname}\`:\n\`\`\`diff\n- ${err.message || err}\n\`\`\`` });
          continue;
        }
      } // end for

      await inter.editReply({ content: emojis.check + ` Completed ${processedCount}/${usernames.length} queries` });

      // Audit logging (same pattern as your xp handler)
      try {
        const logs = await getChannel(config.channels.logs);
        const embed = new MessageEmbed()
          .setDescription(inter.user.toString() + " used `/merit` command.")
          .setColor(colors.green)
          .addFields(
            { name: "Target User(s)", value: usernames.join("\n") || "None" },
            { name: "Newly Awarded Medals", value: awardedList.length ? awardedList.join("\n") : "None" },
            { name: "Action", value: (action === 'add' ? 'Added' : 'Subtracted') + " " + meritsToChange + " Merit(s)" },
            { name: "Completion Rate", value: `${processedCount}/${usernames.length} users` },
          );
        await logs.send({ embeds: [embed] }).catch(async err => {
          const newEmbed = new MessageEmbed()
            .setDescription(inter.user.toString() + " used `/merit` command.")
            .setColor(colors.green)
            .addFields({ name: "Mass Distribution Detected", value: "Sending details in `.txt` file." });

          const msgContent = "TARGET USERS:\n" + usernames.join("\n") + "\n\nNEWLY AWARDED:\n" + (awardedList.length ? awardedList.join("\n") : "None") + "\n\nACTION: " + (action === 'add' ? 'Added' : 'Subtracted') + " " + meritsToChange + " Merit(s)\n\nCOMPLETION RATE: " + `${processedCount}/${usernames.length} users`;
          await logs.send({ embeds: [newEmbed] });
          await safeSend(logs, msgContent);
        });
      } catch (err) {
        console.error("Failed to send merit logs:", err);
      }
    }

    // ---------- VIEWMERIT (show medals + merit progress) ----------
    else if (cname === 'merits') {
      const options = inter.options._hoistedOptions;
      const user_info = options.find(a => a.name === 'user');

      if (!user_info || !user_info.value) {
        return inter.reply({
          content: emojis.warning + " You must provide a user (Discord mention or Roblox username).",
          ephemeral: true
        });
      }

      await inter.deferReply();

      const mentionMatch = String(user_info.value).match(/^<@!?(\d+)>$/);
      try {
        let robloxUser;
        let discordObj;
        let dbUser;

        if (mentionMatch) {
          discordObj = await getMember(user_info.value,inter.guild);
          if (!discordObj || discordObj.error) {
            return inter.editReply({ content: '```diff\n- Failed to resolve the Discord user.```' });
          }

          if (discordObj && discordObj.nickname) {
            let username = discordObj.nickname.split(" ")[1]
            robloxUser = await handler.getUser(username);
          } else {
            robloxUser = await handler.getUser(user_info.value);
          }
          
          if (robloxUser.error) {
            return inter.editReply({ content: '```diff\n- ' + robloxUser.error + '```' });
          }
          dbUser = await users.findOne({ robloxId: robloxUser.id }).exec();
          if (!dbUser) {
            return inter.editReply({ content: emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1409919652494180362> command to link." });
          }

        } else {
          const maybeUsername = String(user_info.value).trim();
          robloxUser = await handler.getUser(maybeUsername);
          if (robloxUser.error) {
            return inter.editReply({ content: '```diff\n- ' + robloxUser.error + '```' });
          }

          dbUser = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
          if (!dbUser) dbUser = await users.create({ robloxId: String(robloxUser.id), xp: 0, merit: 0 });
        }

        if (!robloxUser || !robloxUser.id) {
          return inter.editReply({ content: '```diff\n- Could not resolve the Roblox user.```' });
        }

        // Get role in group
        const group = config.groups[1];
        const groupId = group.groupId;
        const userRole = await handler.getUserRole(groupId, robloxUser.id);
        if (userRole.error) {
          return inter.editReply({ content: emojis.warning + " **" + (robloxUser.displayName ?? robloxUser.name) + " (@" + (robloxUser.name ?? "") + ")** is not in the group." });
        }

        const thumbnail = await handler.getUserThumbnail(robloxUser.id);
        const meritTotal = Number(dbUser.merit ?? 0);

        // officer: derive medals from merit total using config.awards (in the order defined)
        const awards = Array.isArray(config.awards) ? config.awards : [];
        const earned = [];
        for (const award of awards) {
          const req = parseInt(award.requiredMerits || award.requiredMerit || 0, 10) || 0;
          if (meritTotal >= req) {
            earned.push(award.awardName || award.name || `Award(${req})`);
          } else {
            break; // since awards are expected in order, once we hit first not-earned we can break
          }
        }

        // determine next award
        const nextAward = awards.find(a => meritTotal < (parseInt(a.requiredMerits || a.requiredMerit || 0, 10) || 0));
        let nextAwardFieldValue;
        if (!nextAward) {
          // all awards earned or no awards configured
          const topReq = awards.length ? (parseInt(awards[awards.length - 1].requiredMerits || awards[awards.length - 1].requiredMerit || 0, 10) || meritTotal) : 100;
          const progress = getPercentageBar(meritTotal, topReq);
          nextAwardFieldValue = `✅ All medals earned.\n${progress.bar} ${progress.percentage}%\n-#  ${meritTotal}/${topReq} Merit`;
        } else {
          const req = parseInt(nextAward.requiredMerits || nextAward.requiredMerit || 0, 10) || 0;
          const progress = getPercentageBar(meritTotal, req);
          nextAwardFieldValue = `${nextAward.awardName || nextAward.name || "Next Medal"}\n${progress.bar} ${progress.percentage}%\n-#  ${meritTotal}/${req} merits`;
        }

        const embed = new MessageEmbed()
          .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
          .setThumbnail(thumbnail)
          .setColor(colors.green)
          .setFooter({ text: "User ID: " + robloxUser.id })
          .addFields(
            { name: "Army Rank", value: userRole.name ?? ("Rank " + (userRole.rank ?? "Unknown")) },
            { name: "Medals", value: earned.length ? earned.join("\n") : "None" },
            { name: "Progress", value: nextAwardFieldValue }
          );

        await inter.editReply({ embeds: [embed] });

      } catch (err) {
        console.error('merits handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }
    else if (cname === 'update') {
      // unified "user" option (optional)
      const options = inter.options._hoistedOptions;
      const user_info = options.find(a => a.name === 'user');

      // if user_info missing, default to the command invoker
      const rawInput = user_info && user_info.value ? String(user_info.value).trim() : `<@${inter.user.id}>`;

      const group = config.groups[1];
      const groupId = group.groupId;
      const guild = await getGuild("1261688857062281267"); // you used this earlier

      await inter.deferReply();

      const fail = async (msg) => inter.editReply({ content: msg });

      try {
        // Detect Discord mention like <@123...> or raw numeric discord id
        const mentionMatch = rawInput.match(/^<@!?(\d+)>$/);
        const rawDiscordIdMatch = !mentionMatch && rawInput.match(/^(\d{17,20})$/);

        let robloxUser;
        let dbUserRecord;
        let discordIdToPass = null;

        if (mentionMatch || rawDiscordIdMatch) {
          // Resolve Discord user object using your existing getUser (you said it exists)
          const discordIdentifier = mentionMatch ? mentionMatch[0] : rawDiscordIdMatch[1];
          const discordObj = await getUser(discordIdentifier);
          if (!discordObj || discordObj.error) {
            return fail('```diff\n- Failed to resolve the Discord user.```');
          }

          // Find linked robloxId in DB
          dbUserRecord = await users.findOne({ discordId: String(discordObj.id) }).exec();
          if (!dbUserRecord) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1413166977555365969> command to link your account.");
          }

          // Fetch Roblox user by stored robloxId
          robloxUser = await handler.getUser(String(dbUserRecord.robloxId));
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          discordIdToPass = String(discordObj.id);
        } else {
          // Treat as a Roblox username or ID
          robloxUser = await handler.getUser(rawInput);
          if (robloxUser.error) return fail('```diff\n- ' + robloxUser.error + "```");

          // Ensure DB doc exists
          dbUserRecord = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
          if (!dbUserRecord || !dbUserRecord.discordId) {
            return fail(emojis.warning + " This Discord account is not linked to any Roblox account. Use the </connect:1413166977555365969> command to link your account.");
          }

          discordIdToPass = String(dbUserRecord.discordId);

          // prefer to pass discordId to the updater if DB has it
          if (dbUserRecord.discordId) discordIdToPass = String(dbUserRecord.discordId);
        }

        // sanity
        if (!robloxUser || !robloxUser.id) {
          return fail('```diff\n- Could not resolve the Roblox user.```');
        }

        // Call the shared update function
        const result = await updateUserRolesToCurrent(String(robloxUser.id), guild, { discordId: discordIdToPass });

        // Build embed from result
        const thumbnail = await handler.getUserThumbnail(robloxUser.id);

        const added = (result.added && result.added.length > 0) ? result.added.map(r => `<@&${r}>`).join("\n") : "None";
        const removed = (result.removed && result.removed.length > 0) ? result.removed.map(r => `<@&${r}>`).join("\n") : "None";

        const nicknameDisplay = result.nickname ? result.nickname : (dbUserRecord && dbUserRecord.discordId ? `<@${dbUserRecord.discordId}>` : (robloxUser.displayName ?? robloxUser.name ?? "N/A"));

        // Build embed
        const embed = new MessageEmbed()
          .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
          .setThumbnail(thumbnail)
          .setColor(colors.green)
          .setFooter({ text: "Roblox ID: " + robloxUser.id })
          .addFields(
            { name: "Nickname", value: nicknameDisplay },
            { name: "Added Roles", value: added },
            { name: "Removed Roles", value: removed }
          );

        // If there were any errors, append them in a field
        if (result.errors && result.errors.length > 0) {
          embed.addField("Notes", result.errors.join("\n"));
        }

        await inter.editReply({ embeds: [embed] });

      } catch (err) {
        console.error('handler error:', err);
        return inter.editReply({ content: '```diff\n- An unexpected error occurred. Check the bot logs.```' });
      }
    }

  }
  else if (inter.isButton()) {
    let id = inter.customId;
    if (id.startsWith("toggleSelection-")) {
      // customId looks like: toggleSelection-<userId>-<msgId>
      const parts = id.split("-");
      const userId = parts[1];
      const msgId = parts[2];

      if (inter.user.id !== userId) {
        return inter.reply({
          content: emojis.warning + " Only the host can modify this selection.",
          ephemeral: true
        });
      }

      await inter.deferUpdate();

      // fetch the target embed-only message
      const channel = await getChannel(config.channels.selections);
      const targetMsg = await channel.messages.fetch(msgId);

      const embed = targetMsg.embeds[0];
      if (!embed) return;

      const status = embed.description.includes(emojis.on + " OPEN") ? "OPEN" : "CLOSED";

      // clone embed
      const newEmbed = new MessageEmbed(embed);

      // clone row & button from the interaction (not from targetMsg!)
      const row = inter.message.components[0];
      const button = row.components[0];

      const newRow = new MessageActionRow();

      if (status === "OPEN") {
        // update embed text
        newEmbed.setDescription(
          embed.description.replace(emojis.on + " OPEN", emojis.off + " CLOSED")
        );

        // toggle button
        const toggleButton = new MessageButton(button)
          .setLabel("Open Selection") // user clicked, so it becomes OPENABLE again
          .setStyle("SECONDARY")
          .setEmoji(emojis.off);

        // end button
        const endButton = new MessageButton()
          .setCustomId("endSelection-" + inter.user.id + "-" + msgId)
          .setLabel("End")
          .setStyle("DANGER");

        newRow.addComponents(toggleButton, endButton);

      } else {
        newEmbed.setDescription(
          embed.description.replace(emojis.off + " CLOSED", emojis.on + " OPEN")
        );

        // toggle button
        const toggleButton = new MessageButton(button)
          .setLabel("Close Selection") // user clicked, so it becomes CLOSABLE again
          .setStyle("SECONDARY")
          .setEmoji(emojis.on);

        // end button
        const endButton = new MessageButton()
          .setCustomId("endSelection-" + inter.user.id + "-" + msgId)
          .setLabel("End")
          .setStyle("DANGER");

        newRow.addComponents(toggleButton, endButton);
      }

      // ✅ edit the embed-only message
      await targetMsg.edit({ embeds: [newEmbed] });

      // ✅ update the interaction’s controls
      await inter.editReply({ components: [newRow] });
    }
    else if (id.startsWith("endSelection-")) {
      // customId looks like: endSelection-<userId>-<msgId>
      const parts = id.split("-");
      const userId = parts[1];
      const msgId = parts[2];

      if (inter.user.id !== userId) {
        return inter.reply({
          content: emojis.warning + " Only the host can end this selection.",
          ephemeral: true
        });
      }

      await inter.deferUpdate();

      // fetch the target message
      const channel = await getChannel(config.channels.selections)
      const targetMsg = await channel.messages.fetch(msgId);

      // delete the target message
      await targetMsg.delete().catch(() => { });

      // build the "Selection Ended" disabled button
      const endedRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("selectionEnded")
          .setLabel("Selection Ended")
          .setStyle("SECONDARY")
          .setDisabled(true)
          .setEmoji(emojis.red)
      );

      // update the interaction’s message to replace controls
      await inter.editReply({
        components: [endedRow]
      });
    }
    else if (id.startsWith("toggleTraining-")) {
      // customId looks like: toggleSelection-<userId>-<msgId>
      const parts = id.split("-");
      const userId = parts[1];
      const msgId = parts[2];

      if (inter.user.id !== userId) {
        return inter.reply({
          content: emojis.warning + " Only the host can modify this selection.",
          ephemeral: true
        });
      }

      await inter.deferUpdate();

      const channel = await getChannel(config.channels.trainings)
      const targetMsg = await channel.messages.fetch(msgId);

      const embed = targetMsg.embeds[0];
      if (!embed) return;

      const status = embed.description.includes(emojis.on + " OPEN") ? "OPEN" : "CLOSED";

      const newEmbed = new MessageEmbed(embed);

      const row = inter.message.components[0];
      const button = row.components[0];

      const newRow = new MessageActionRow();

      if (status === "OPEN") {
        newEmbed.setDescription(
          embed.description.replace(emojis.on + " OPEN", emojis.off + " CLOSED")
        );

        // toggle button
        const toggleButton = new MessageButton(button)
          .setLabel("Open Training") // user clicked, so it becomes OPENABLE again
          .setStyle("SECONDARY")
          .setEmoji(emojis.off);

        // end button
        const endButton = new MessageButton()
          .setCustomId("endTraining-" + inter.user.id + "-" + msgId)
          .setLabel("End")
          .setStyle("DANGER");

        newRow.addComponents(toggleButton, endButton);

      } else {
        newEmbed.setDescription(
          embed.description.replace(emojis.off + " CLOSED", emojis.on + " OPEN")
        );

        // toggle button
        const toggleButton = new MessageButton(button)
          .setLabel("Close Training") // user clicked, so it becomes CLOSABLE again
          .setStyle("SECONDARY")
          .setEmoji(emojis.on);

        // end button
        const endButton = new MessageButton()
          .setCustomId("endTraining-" + inter.user.id + "-" + msgId)
          .setLabel("End")
          .setStyle("DANGER");

        newRow.addComponents(toggleButton, endButton);
      }

      await targetMsg.edit({ embeds: [newEmbed] });
      await inter.editReply({ components: [newRow] });
    }
    else if (id.startsWith("endTraining-")) {
      // customId looks like: endSelection-<userId>-<msgId>
      const parts = id.split("-");
      const userId = parts[1];
      const msgId = parts[2];

      if (inter.user.id !== userId) {
        return inter.reply({
          content: emojis.warning + " Only the host can end this training.",
          ephemeral: true
        });
      }

      await inter.deferUpdate();

      // fetch the target message
      const channel = await getChannel(config.channels.trainings)
      const targetMsg = await channel.messages.fetch(msgId);

      // delete the target message
      await targetMsg.delete().catch(() => { });

      // build the "Selection Ended" disabled button
      const endedRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("TrainingEnded")
          .setLabel("Training Ended")
          .setStyle("SECONDARY")
          .setDisabled(true)
          .setEmoji(emojis.red)
      );

      // update the interaction’s message to replace controls
      await inter.editReply({
        components: [endedRow]
      });
    }

    else if (id.startsWith("none")) {
      inter.deferUpdate();
    }
  }
});

process.on('unhandledRejection', async error => {
  console.log(error);
});

app.post('/verify', async (req, res) => {
  if (stopFlow) return;
  try {
    if (VERIFY_SECRET) {
      const headerSecret = req.get('X-VERIFY-SECRET') || req.get('x-verify-secret');
      if (!headerSecret || headerSecret !== VERIFY_SECRET) {
        return res.status(401).json({ ok: false, error: 'invalid-secret' });
      }
    }

    const { robloxId, code, robloxUsername } = req.body ?? {};
    if (!robloxId || !code) {
      return res.status(400).json({ ok: false, error: "missing-robloxId-or-code" });
    }

    const entry = codesByCode.get(String(code));
    if (!entry) {
      return res.status(400).json({ ok: false, error: 'invalid-or-expired-code' });
    }

    // Check expiry
    if (entry.expiresAt <= Date.now()) {
      // cleanup
      codesByCode.delete(String(code));
      codeByDiscord.delete(entry.discordId);
      return res.status(400).json({ ok: false, error: 'invalid-or-expired-code' });
    }

    const discordId = entry.discordId;
    let robloxDoc = await users.findOne({ robloxId }).exec();

    // 2) If another doc has this discordId but different robloxId, unset it
    const conflictingDoc = await users.findOne({ discordId }).exec();
    if (conflictingDoc && (!robloxDoc || conflictingDoc.robloxId !== robloxDoc.robloxId)) {
      // remove discordId from conflicting doc (unlink previous mapping)
      conflictingDoc.discordId = undefined;
      await conflictingDoc.save();
    }

    if (robloxDoc) {
      robloxDoc.discordId = discordId;
      await robloxDoc.save();
    } else {
      robloxDoc = new users({
        robloxId,
        discordId,
        xp: 0,
      });
      await robloxDoc.save();
    }

    codesByCode.delete(String(code));
    codeByDiscord.delete(discordId);

    (async () => {
      try {
        const guildData = await getGuild("1261688857062281267")
        const user = await client.users.fetch(discordId);
        const robloxUser = await handler.getUser(robloxUsername);
        const group = config.groups[1]

        const member = await getMember(user.id, guildData)
        if (member) {
          let userRole = await handler.getUserRole(group.groupId, robloxUser.id);
          if (!userRole.error) {
            let groupRole = group.roles.find(r => r.rank === userRole.rank);
            member.setNickname(groupRole.prefix + " " + robloxUser.name)

            const result = await updateUserRolesToCurrent(String(robloxUser.id), guildData, { discordId: user.id });
            // Build embed from result
            const thumbnail = await handler.getUserThumbnail(robloxUser.id);

            const nicknameDisplay = result.nickname ? result.nickname : (robloxDoc && robloxDoc.discordId ? `<@${robloxDoc.discordId}>` : (robloxUser.displayName ?? robloxUser.name ?? "N/A"));

            // Build embed
            const embed = new MessageEmbed()
              .setAuthor({ name: (robloxUser.displayName ?? robloxUser.name) + ' (@' + (robloxUser.name ?? "") + ')', iconURL: thumbnail })
              .setThumbnail(thumbnail)
              .setColor(colors.green)
              .setFooter({ text: "Roblox ID: " + robloxUser.id })
              .addFields(
                { name: "Nickname", value: nicknameDisplay },
                { name: "Added Roles", value: result.added.length.toString() },
                { name: "Removed Roles", value: result.removed.length.toString() }
              );

            // If there were any errors, append them in a field
            if (result.errors && result.errors.length > 0) {
              embed.addField("Notes", result.errors.join("\n"));
            }

            await user.send({ embeds: [embed] }).catch(err => console.log(err));
          }
        }

        let embed = new MessageEmbed()
          .setTitle(robloxUser.displayName + ' (@' + robloxUser.name + ')')
          .setDescription(emojis.on + " Your discord has been linked to this roblox account.")
          .setFooter({ text: "User ID: " + robloxUser.id })
          .setColor(colors.green)

        await user.send({ embeds: [embed] });
      } catch (dmErr) {
        console.warn(`Failed to DM verification success to ${discordId}:`, dmErr?.message || dmErr);
      }
    })();

    // Respond to the Roblox game that verify succeeded
    return res.json({
      ok: true,
      robloxId,
      discordId,
      message: 'linked',
    });

  } catch (err) {
    console.error("POST /verify error:", err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

app.get('/_verify_status/:discordId', (req, res) => {
  if (stopFlow) return;
  const discordId = req.params.discordId;
  const code = codeByDiscord.get(discordId);
  if (!code) return res.json({ ok: true, active: false });
  const entry = codesByCode.get(code);
  if (!entry) return res.json({ ok: true, active: false });
  return res.json({ ok: true, active: true, code, expiresAt: entry.expiresAt });
});

// health check
app.get('/', (req, res) => res.json({ ok: true }));

async function updateUserRolesToCurrent(robloxId, guild, opts = {}) {
  const summary = {
    ok: false,
    memberFound: false,
    robloxUser: null,
    // groupRole (single) kept for compatibility (first match), and matchedGroups (all matches)
    groupRole: null,
    matchedGroups: [], // [{ groupId, mainRole, matchedRoleConfig }]
    added: [],
    removed: [],
    skippedAdd: [],
    skippedRemove: [],
    nickname: null,
    errors: [],
  };

  try {
    // Resolve roblox user details (handler.getUser handles id or username)
    let robloxUser;
    try {
      robloxUser = await handler.getUser(String(robloxId));
      if (robloxUser && robloxUser.error) {
        summary.errors.push(`Roblox lookup failed: ${robloxUser.error}`);
        return summary;
      }
    } catch (e) {
      summary.errors.push(`Roblox lookup error: ${e.message || e}`);
      return summary;
    }
    summary.robloxUser = robloxUser;

    // Build the global sets:
    // desiredRolesSet = roles we must ensure the member has (collected from all groups where user is a member)
    // allConfiguredRoleIdsSet = every configured discord role id across every group's roles + every group's mainRole
    const desiredRolesSet = new Set();
    const allConfiguredRoleIdsSet = new Set();

    // Iterate all groups in config.groups and detect membership per group.
    for (const groupCfg of (config.groups || [])) {
      const groupId = groupCfg.groupId;
      // collect mainRole into the global configured set (may be empty/undefined)
      if (groupCfg.mainRole) allConfiguredRoleIdsSet.add(String(groupCfg.mainRole));

      // collect all group's configured discord role ids into global configured set
      if (Array.isArray(groupCfg.roles)) {
        for (const gr of groupCfg.roles) {
          if (Array.isArray(gr.roles)) {
            for (const rid of gr.roles) {
              if (rid) allConfiguredRoleIdsSet.add(String(rid));
            }
          }
        }
      }

      // Ask handler if this Roblox user has a role in this group
      let userRole;
      try {
        userRole = await handler.getUserRole(groupId, robloxUser.id);
      } catch (e) {
        // treat as not-in-group but continue other groups
        userRole = { error: e.message || String(e) };
      }

      if (userRole && !userRole.error) {
        // The user is in this Roblox group. Grant the mainRole for this group (if provided)
        if (groupCfg.mainRole) desiredRolesSet.add(String(groupCfg.mainRole));

        // Find the matching configured groupRole in this group's `roles` array by Roblox role id
        const matchedRoleConfig = Array.isArray(groupCfg.roles)
          ? groupCfg.roles.find(r => String(r.rank) === String(userRole.rank))
          : null;

        if (matchedRoleConfig) {
          // Add its discord role ids to desiredRoles
          if (Array.isArray(matchedRoleConfig.roles)) {
            for (const rid of matchedRoleConfig.roles) {
              if (rid) desiredRolesSet.add(String(rid));
            }
          }

          // push matched group info to summary.matchedGroups
          summary.matchedGroups.push({
            groupId,
            mainRole: groupCfg.mainRole ? String(groupCfg.mainRole) : null,
            matchedRoleConfig,
            userRoleInfo: userRole
          });

          // if we don't yet have a single groupRole for compatibility, set it to this matchedRoleConfig
          if (!summary.groupRole) summary.groupRole = matchedRoleConfig;
        } else {
          // No specific matched role config found, still we added mainRole above, and record match without matchedRoleConfig
          summary.matchedGroups.push({
            groupId,
            mainRole: groupCfg.mainRole ? String(groupCfg.mainRole) : null,
            matchedRoleConfig: null,
            userRoleInfo: userRole
          });
        }
      } // end if user in group
    } // end for groups

    // If no group matches found at all, return with an error note
    if (summary.matchedGroups.length === 0) {
      summary.errors.push('User is not a member of any configured group.');
      // still set ok true so callers can inspect summary, but no changes were performed
      summary.ok = true;
      return summary;
    }

    // Build array form and finalize sets
    const desiredRoles = Array.from(desiredRolesSet);
    const allConfiguredRoleIds = Array.from(allConfiguredRoleIdsSet);

    // Resolve member: prefer opts.discordId, otherwise check DB for linked discordId
    let member = null;
    let discordId = opts.discordId;
    try {
      if (!discordId) {
        const dbRec = await users.findOne({ robloxId: String(robloxUser.id) }).exec();
        if (dbRec && dbRec.discordId) discordId = dbRec.discordId;
      }
      if (discordId) {
        member = await getMember(String(discordId), guild).catch(e => { throw e; });
      }
    } catch (e) {
      // log, continue (we'll return planned lists if no member)
      summary.errors.push(`getMember failed: ${e.message || e}`);
      member = null;
    }

    // Helper to filter out non-existent guild roles
    const filterExistingRoleIds = (rids) => {
      if (!guild || !guild.roles || !guild.roles.cache) return rids;
      return rids.filter(rid => guild.roles.cache.has(rid));
    };

    // Filter desired and configured lists to existing guild roles
    const validDesiredRoles = filterExistingRoleIds(desiredRoles);
    const validConfiguredRoleIds = filterExistingRoleIds(allConfiguredRoleIds);

    // If no member found -> return planned lists and stop
    if (!member) {
      summary.memberFound = false;
      summary.added = [];
      summary.removed = [];
      summary.skippedAdd = validDesiredRoles.slice();
      summary.skippedRemove = validConfiguredRoleIds.filter(rid => !validDesiredRoles.includes(rid));
      summary.nickname = null;
      summary.ok = true;
      return summary;
    }

    // Member found -> compute current roles
    summary.memberFound = true;
    const memberRoles = member.roles && member.roles.cache ? member.roles.cache : new Map();

    // Roles to remove = configured roles (validConfiguredRoleIds) that are NOT in validDesiredRoles, but only those the member currently has
    const rolesToActuallyRemove = validConfiguredRoleIds
      .filter(rid => !validDesiredRoles.includes(rid))
      .filter(rid => memberRoles.has(rid));

    // Roles to actually add = validDesiredRoles that member doesn't have yet
    const rolesToActuallyAdd = validDesiredRoles.filter(rid => !memberRoles.has(rid));

    // Remove roles
    if (rolesToActuallyRemove.length > 0) {
      try {
        await removeRole(member, rolesToActuallyRemove);
        summary.removed = rolesToActuallyRemove.slice();
      } catch (e) {
        summary.errors.push(`removeRole error: ${e.message || e}`);
        summary.removed = rolesToActuallyRemove.slice();
      }
    } else {
      summary.removed = [];
    }

    // Add roles
    if (rolesToActuallyAdd.length > 0) {
      try {
        await addRole(member, rolesToActuallyAdd, guild);
        summary.added = rolesToActuallyAdd.slice();
      } catch (e) {
        summary.errors.push(`addRole(s) error: ${e.message || e}`);
        summary.added = rolesToActuallyAdd.slice();
      }
    } else {
      summary.added = [];
    }

    // Fill skipped lists
    summary.skippedAdd = validDesiredRoles.filter(rid => !summary.added.includes(rid));
    summary.skippedRemove = validConfiguredRoleIds.filter(rid => !summary.removed.includes(rid) && !validDesiredRoles.includes(rid));

    // Determine prefix to use: use prefix of the FIRST matched groupRole config that has a prefix (in config order)
    let chosenPrefix = null;
    for (const mg of summary.matchedGroups) {
      if (mg.matchedRoleConfig && mg.matchedRoleConfig.prefix) {
        chosenPrefix = String(mg.matchedRoleConfig.prefix).trim();
        break;
      }
    }

    // Attempt to set nickname using chosenPrefix (or fallback to robloxUser.name)
    try {
      const newNick = chosenPrefix ? `${chosenPrefix} ${robloxUser.name}` : `${robloxUser.name}`;
      if (member.displayName !== newNick) {
        await member.setNickname(newNick);
      }
      summary.nickname = member.displayName || newNick;
    } catch (e) {
      summary.errors.push(`setNickname failed: ${e.message || e}`);
      summary.nickname = member.displayName || null;
    }

    summary.ok = true;
    return summary;
  } catch (err) {
    summary.errors.push(`Unexpected error: ${err.message || err}`);
    return summary;
  }
}
