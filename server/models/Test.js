const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Test", TestSchema);