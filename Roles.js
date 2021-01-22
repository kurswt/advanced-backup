const { Schema, model } = require("mongoose");

const schema = new Schema({ 
    Id: String, 
    Members: { type: Array, default: [] }
});

module.exports = model("Roles", schema);