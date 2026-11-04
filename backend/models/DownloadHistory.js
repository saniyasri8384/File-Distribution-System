const mongoose = require("mongoose");

const downloadHistorySchema = new mongoose.Schema(
    {
        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            required: true
        },

        downloadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        downloadedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const DownloadHistory = mongoose.model(
    "DownloadHistory",
    downloadHistorySchema
);

module.exports = DownloadHistory;