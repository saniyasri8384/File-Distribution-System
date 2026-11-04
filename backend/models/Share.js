const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
    {
        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },

        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sharedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        permission: {
            type: String,
            enum: ["view", "download"],
            default: "download"
        },

        expiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Share = mongoose.model("Share", shareSchema);

module.exports = Share;