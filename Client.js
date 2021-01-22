const { Client } = require("discord.js");
const { SERVER_ID, STATUS, MAIN_TOKEN, DATABASE_NAME, AUTHOR, SAFE_BOTS, SAFE_USERS } = require("./configurations.json").DEFAULTS;

module.exports = class AetherClient extends Client {
    constructor(token) {
        super();
        this.token = token;
        this.author = AUTHOR;
        this.renk = {
            "mor": "#3c0149",
            "mavi": "#10033d",
            "turkuaz": "#00ffcb",
            "kirmizi": "#750b0c",
            "yesil": "#032221"
        };
        this.randomColor = function () {
            return this.renk[Object.keys(this.renk).random()];
        };
        this.closeAllPermissionsFromRoles = async () => {
            let g = this.guilds.cache.get(SERVER_ID);
            if (!g) return;
            g.roles.cache.filter(r => r.editable && perms.some(x => r.permissions.has(x))).forEach(async (x) => {
                await x.setPermissions(0);
            });   
        };
        Array.prototype.random = function () {
            return this[Math.floor((Math.random()*this.length))];
          };
          this.whitelisted = function (id) {
            let g = this.guilds.cache.get(SERVER_ID);
            let m = g.members.cache.get(id);
            if (!m || m.id === this.user.id || SAFE_BOTS.includes(m.id) || SAFE_USERS.includes(m.id)) return true;
            else return false;
        };
    };
};