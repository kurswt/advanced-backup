const client = (global.client = new backupClient(MAIN_TOKEN));
const { DATABASE_NAME } = require("./configurations.json").DEFAULTS;
const mongoose = require("mongoose");
const { approvedConsole, declinedConsole, mongooseConnected, roleBackup, channelBackup } = require("./functions");
mongoose.connect("mongo connection url".replace("<dbname>", DATABASE_NAME), {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once("open", async () => {
    require("./functions");
    
    await channelBackup();
    await roleBackup();
    await mongooseConnected();
    client.login(MAIN_TOKEN).then(approvedConsole("Bot başarılı bir şekilde giriş yaptı.")).catch(e => { 
        declinedConsole("Bot giriş yaparken bir sorun çıktı!");
        console.error(e);
    });
});

