const { Schema, model } = require("mongoose");

const schema = new Schema({ 
    Id: String,
    Type: String,
    Permissions: { type: Array, default: [] },
    Parent: { type: String, default: null }
});

module.exports = model("Channel", schema);