
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true
        },

        fileName: {
            type: String,
            required: true
        },

        // Retained for older locally stored files
        filePath: {
            type: String,
            default: null
        },

        // Retained for compatibility with existing records
        cloudinaryUrl: {
            type: String,
            default: null
        },

        cloudinaryPublicId: {
            type: String,
            default: null
        },

        cloudinaryResourceType: {
            type: String,
            default: null
        },

        cloudinaryDeliveryType: {
            type: String,
            default: null
        },

        mimeType: {
            type: String,
            required: true
        },

        size: {
            type: Number,
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;
