const chalk = require("chalk");
const { Permissions } = require("discord.js");
const { LOG_CHANNEL, AUTHOR } = require("./configurations.json").DEFAULTS;
const moment = require("moment");
const roleDatabase = require("./Roles");
const channelDatabase = require("./Channel");

module.exports = {

    roleBackup: async (guild) => {
        await roleDatabase.deleteMany({});
        guild.roles.cache.array().filter(e => !e.managed).forEach(async role => {
            await new roleDatabase({
                Id: role.id,
                Members: role.members.array().map(e => e.id)
            }).save()
        });
    },

    channelBackup: async (guild) => {
        await channelDatabase.deleteMany({});
        guild.channels.cache.forEach(async channel => {
            await new channelDatabase({
                Id: channel.id,
                Type: channel.type,
                Permissions: channel.permissionOverwrites.array().map(perms => this.changePermissions(perms)),
                Parent: channel.parent ? channel.parentID : null
            }).save();
        });
    },

    changePermissions: (perms) => {
    let array = {};
        array.id = perms.id 
        array.type = perms.type
        array.allow = new Permissions(perms.allow.bitfield).toArray()
        array.deny === new Permissions(perms.deny.bitfield).toArray()
    return array;
    },

    approvedConsole: (log = String) => {
        console.log(chalk`{bgGreen [SUCCESSFUL]} ${log}`);
    },

    declinedConsole: (log = String) => {
        console.log(chalk`{bgRed [DECLINED]} ${log}`);
    },

    mongooseConnected: () => {
        console.log(chalk`{bgGreen [MONGOOSE]} Mongoose successfully connected.`);
    },

    logMessage: (client, log = String) => {
        let Guild = client.guilds.cache.get(SERVER_ID);
        let Channel = Guild.channels.cache.get(LOG_CHANNEL);
        const embed = new MessageEmbed().setTitle(Guild.name, Guild.iconURL({dynamic: true, size: 2048})).setColor(client.randomColor()).setTimestamp().setFooter(client.users.cache.get(AUTHOR).tag).setDescription(log);
        if (Channel) Channel.send(embed);
    },

    clientAuthorSend: (client, log = String) => {
        const author = client.users.cache.get(AUTHOR);
        const embed = new MessageEmbed().setTitle(Guild.name, Guild.iconURL({dynamic: true, size: 2048})).setColor(client.randomColor()).setTimestamp().setFooter(client.users.cache.get(AUTHOR).tag).setDescription(log);
        author.send(embed)
    },

    guardConsoleLog: async (client, value = String, executor = String, type = Number, secondValue = String) => {
        let Guild = client.guilds.cache.first();
        if (type === 0) {
            console.log(chalk`{bgCyan [ROLE CREATED]} a role created in ${client.guilds.cache.first().name}
- CREATED ROLE ID: ${value}
- ROLE DELETED?: ${client.guilds.cache.first().roles.cache.has(value) ? chalk`{red No}` : chalk`{green Yes}`}
- EXECUTOR: ${client.users.cache.get(executor).tag} - ${executor} ${!Guild.members.cache.has(executor) ? chalk`{bgGreen BANNED}` : chalk`{bgRed NOT BANNED}`}
- TIMESTAMP: {inverse ${moment().format("YYYY-MM-DD HH:mm:ss")}} 
            `)
        } else if (type === 1) {
            let what;
            let data = await roleDatabase.findOne({ Id: value }).exec();
            if (data) what = "Found";
            if (!data) what = "Not Found";
            console.log(chalk`{bgRed [ROLE DELETED]} a role deleted in {cyan ${Guild.name}}
- Role Backup in Database?: ${what = "Found" ? chalk`{green Found}` : chalk`{red Not Found}`}
- Role ID: ${value}
- Role Guild ID: ${Guild.id}
- Executor: ${client.users.cache.get(executor).tag} - ${executor} ${!Guild.members.cache.has(executor) ? chalk`{bgGreen BANNED}` : chalk`{bgRed NOT BANNED}`}
- Deleted Time: {inverse ${moment().format("YYYY-MM-DD HH:mm:ss")}}
            `)
        } else if (type === 2) {
            let oldRole = Guild.roles.cache.get(value);
            console.log(chalk`{bgYellow [ROLE UPDATE]} a role updated in {underline ${Guild.name}}
- UPDATED ROLE NAME: ${oldRole.name}
- UPDATED ROLE ID: ${value}
- UPDATED ROLE COLOR: ${oldRole.hexColor}
- UPDATED ROLE POSITION: ${oldRole.position}
- UPDATED ROLE MENTIONABLE: ${oldRole.mentionable ? chalk`{bgGreen true}` : chalk`{bgRed false}`}
- UPDATED ROLE HOIST: ${oldRole.hoist ? chalk`{bgGreen true}` : chalk`{bgRed false}`}
- EXECUTOR: ${client.users.cache.get(executor).tag} - ${executor} ${!Guild.members.cache.has(executor) ? chalk`{bgGreen BANNED}` : chalk`{bgRed NOT BANNED}`}
- TIMESTAMP: {inverse ${moment().format("YYYY-MM-DD HH:mm:ss")}} 
            `)
        } else if (type === 3) {
            console.log(chalk`{bgRed [CHANNEL DELETED]} a channel deleted in {cyan ${Guild.name}}
- Channel ID: ${value}
- Channel Guild ID: ${Guild.id}
- Executor: ${client.users.cache.get(executor).tag} - ${executor} ${!Guild.members.cache.has(executor) ? chalk`{bgGreen BANNED}` : chalk`{bgRed NOT BANNED}`}
- Deleted Time: {inverse ${moment().format("YYYY-MM-DD HH:mm:ss")}}
            `)
        };
    }

};
