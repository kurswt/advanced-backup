const backupClient = require("./Client");
const { MessageEmbed } = require("discord.js");
const { SERVER_ID, STATUS, MAIN_TOKEN, DATABASE_NAME, AUTHOR, SAFE_BOTS, SAFE_USERS, VOICE_CHANNEL, PREFIX, OWNER_ROLE } = require("./configurations.json").DEFAULTS;
const { roleBackup, channelBackup, guardConsoleLog, approvedConsole, declinedConsole, logMessage, clientAuthorSend, changePermissions } = require("./functions");
const client = (global.client = new backupClient(MAIN_TOKEN));
const roleDatabase = require("./Roles");
const channelDatabase = require("./Channel");
let dangerMode = false;
require("./clientConnection");

client.on("ready", async () => {
    client.user.setPresence({ activity: { name: STATUS }, status: "dnd" });
    client.guilds.cache.get(SERVER_ID).channels.cache.get(VOICE_CHANNEL).join().catch();
    setInterval(async () => {
        if (dangerMode === true) return;
        await roleBackup(client.guilds.cache.get(SERVER_ID));
        await channelBackup(client.guilds.cache.get(SERVER_ID));
    }, 1000*60*60*1);
});

client.on("message", async message => {
    if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(PREFIX) || (message.author.id !== AUTHOR && !message.member.roles.cache.has(OWNER_ROLE) && message.author.id !== message.guild.owner.id)) return;
    let args = message.content.split(' ').slice(1);
    let komut = message.content.split(' ')[0].slice(PREFIX.length);
    let embed = new MessageEmbed().setTitle(message.member.displayName).setColor(client.randomColor()).setFooter(`${client.users.cache.get(AUTHOR).tag}`);
    if (komut === "eval") {
        if (message.author.id !== ayar.sahip) return;
        if (!args[0]) return message.channel.send(`Denemek istediğin kodu girmelisin`);
          let kod = args.join(' ');
          function clean(text) {
          if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
          text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
          return text;
        };
        try { 
          var evall = clean(await eval(kod));
          if(evall.match(new RegExp(`${client.token}`, 'g'))) evall.replace(client.token, "Bu komudu kullanman yasak.");
          message.channel.send(`${evall.replace(client.token, "Bu komudu kullanman yasak.")}`, {code: "js", split: true});
        } catch(err) { message.channel.send(err, {code: "js", split: true}) };
    };
});

client.on("roleCreate", async role => {
    let entry = await role.guild.fetchAuditLogs({ limit: 1, type: 'ROLE_CREATE' }).then(x => x.entries.first());
    if (!entry || !entry.executor || entry.executor.id == role.guild.ownerID || client.whitelisted(entry.executor.id)) return;
    await client.punish(entry.executor.id).catch();
    await guardConsoleLog(client, role.id, entry.executor.id, 0);
    await logMessage(`${entry.executor} adlı üye bir rol oluşturdu, rol silindi ve üye sunucudan uzaklaştırıldı!`);
    await role.delete();
});

client.on("roleDelete", async role => {
    let entry = await role.guild.fetchAuditLogs({ limit: 1, type: 'ROLE_DELETE' }).then(x => x.entries.first());
    if (!entry || !entry.executor || entry.executor.id == role.guild.ownerID || client.whitelisted(entry.executor.id)) return;
    await client.punish(entry.executor.id).catch();
    await guardConsoleLog(client, role.id, entry.executor.id, 1);
    await logMessage(`${entry.executor} (\`${entry.executor.id}\`) adlı kullanıcı bir rol sildi!`)
    await clientAuthorSend(`${entry.executor} (\`${entry.executor.id}\`) adlı kullanıcı bir rol sildi!`)
    await client.closeAllPermissionsFromRoles();
    dangerMode = true;
    setTimeout(() => {
        dangerMode = false;
    }, 1000*60*30);
    let createdRole = await role.guild.roles.create({
        data: {
            name: role.name,
            color: role.hexColor,
            position: role.position,
            hoist: role.hoist,
            mentionable: role.mentionable,
            permissions: role.permissions
        }, reason: "Aether Role Guard"
    });

    let changeData = await roleDatabase.findOneAndUpdate({ Id: role.id }, { $set: { Id: createdRole.id } }).exec();
    if (!changeData) return;

    setTimeout(() => {
        channelDatabase.updateMany({ "Permissions.id": role.id }, { $set: {"Permissions.$.id": createdRole.id }}, { upsert: true }).exec(async (err, res) => {
            if (err) console.error(err);
            let x = await channelDatabase.find({"Permissions.id": createdRole.id});
            if(!x || createdRole.deleted) return;
            for (let index = 0; index < x.length; index++) {
                let y = x[index];
                if(createdRole.deleted) break;
                let channel = role.guild.channels.cache.get(y.Id);
                if (!channel) continue;
                channel.edit({
                    type: y.Type,
                    permissionOverwrites: y.Permissions
                });
            }
        });      
    }, 4750);

    if (changeData.Members.length < 1) return;
    changedData.Members.forEach((x, index) => {
        let m = role.guild.members.cache.get(x);
        if (!m || m.roles.cache.has(createdRole.id)) return;
        setTimeout(() => {
            m.roles.add(createdRole.id).catch();
        }, index*1750);
    });
});

client.on("roleUpdate", async (oldRole, newRole) => {
    let entry = await newRole.guild.fetchAuditLogs({ limit: 1, type: 'ROLE_UPDATE' }).then(x => x.entries.first());
    if (!entry || !entry.executor || client.whitelisted(entry.executor.id)) return;
    await client.punish(entry.executor.id).catch();
    await guardConsoleLog(client, newRole.id, entry.executor.id, 2);
    await logMessage(`${entry.executor} (\`${entry.executor.id}\`) adlı kullanıcı bir rol güncelledi ve rolü eski haline geri çevirdim, daha detaylı bilgileri konsola attım.`);
    if (dangerPerms.some(x => !oldRole.permissions.has(x) && newRole.permissions.has(x))) {
        newRole.setPermissions(oldRole.permissions);
    };
    newRole.edit({ ...oldRole });
});

client.on("channelDelete", async (channel) => {
    let entry = await channel.guild.fetchAuditLogs({ limit: 1, type: "CHANNEL_DELETE" }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || client.whitelisted(entry.executor.id)) return;
    await client.punish(entry.executor.id).catch();
    await guardConsoleLog(client, channel.id, entry.executor.id, 3);
    await logMessage(`${entry.executor} (\`${entry.executor.id}\`) adlı kullanıcı bir kanal sildi!`)
    await clientAuthorSend(`${entry.executor} (\`${entry.executor.id}\`) adlı kullanıcı bir kanal sildi!`)
    await client.closeAllPermissionsFromRoles();
    dangerMode = true;
    setTimeout(() => {
        dangerMode = false;
    }, 1000*60*30);
    await channel.clone().then(async (chnl) => {
        await channelDatabase.findOneAndUpdate({ Id: channel.id }, { $set: { Id: chnl.id } }).exec();
        if (channel.parentID != null) await chnl.setParent(channel.parentID);
        await chnl.setPosition(channel.position);
        if (channel.type == "category") {
            let x = await channelDatabase.find({ Parent: channel.id }).exec();
            if (x) {
                await x.forEach(async (c) => await client.channels.cache.get(c.Id).setParent(chnl.id))
                channelDatabase.findOneAndUpdate({ Parent: channel.id }, { $set: { Parent: chnl.id } }).exec(async (e, res) => {
                    if (e) console.error(e);
                });
            }
        }
    });
});