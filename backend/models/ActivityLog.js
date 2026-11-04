const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            enum: [
                "UPLOAD",
                "DOWNLOAD",
                "DELETE",
                "SHARE",
                "CHANGE_PERMISSION",
                "REVOKE_SHARE"
            ],
            required: true
        },

        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File",
            default: null
        },

        details: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const ActivityLog = mongoose.model(
    "ActivityLog",
    activityLogSchema
);

module.exports = ActivityLog;