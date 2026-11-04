const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const User = require("../models/User");
const Share = require("../models/Share");
const DownloadHistory = require("../models/DownloadHistory");
const ActivityLog = require("../models/ActivityLog");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const fs = require("fs/promises");
const router = express.Router();
const { Readable } = require("stream");



// Where uploaded files will be stored

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const getCloudinaryDeliveryUrl = (file) => {
    if (file.cloudinaryPublicId) {
        return cloudinary.url(file.cloudinaryPublicId, {
            resource_type: file.cloudinaryResourceType || "image",
            type: file.cloudinaryDeliveryType || "authenticated",
            sign_url: true,
            secure: true
        });
    }

    // Support older files that already have a Cloudinary URL
    if (file.cloudinaryUrl) {
        return file.cloudinaryUrl;
    }

    throw new Error("Cloudinary file reference is missing");
};


router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
        let createdFile = null;
        let cloudinaryResult = null;

        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Please select a file"
                });
            }

            // Upload file to Cloudinary
            cloudinaryResult = await uploadToCloudinary(req.file);

            // Save file information in MongoDB
            createdFile = await File.create({
                originalName: req.file.originalname,
                fileName: cloudinaryResult.public_id,
                filePath: null,
                cloudinaryUrl: null,
                cloudinaryPublicId: cloudinaryResult.public_id,
                cloudinaryResourceType: cloudinaryResult.resource_type,
                cloudinaryDeliveryType: cloudinaryResult.type,
                mimeType: req.file.mimetype,
                size: cloudinaryResult.bytes,
                uploadedBy: req.user.userId
            });

            // Create activity log
            await ActivityLog.create({
                user: req.user.userId,
                action: "UPLOAD",
                file: createdFile._id,
                details: `File uploaded: ${createdFile.originalName}`
            });

            return res.status(201).json({
                message: "File uploaded successfully",
                file: createdFile
            });

        } catch (error) {
            console.error("File upload error:", error);

            // Remove database record if created
            if (createdFile) {
                try {
                    await File.deleteOne({
                        _id: createdFile._id
                    });
                } catch (cleanupError) {
                    console.error("Database cleanup failed:", cleanupError);
                }
            }

            // Remove Cloudinary file if upload succeeded
            if (cloudinaryResult) {
                try {
                    await cloudinary.uploader.destroy(
                        cloudinaryResult.public_id,
                        {
                            resource_type: cloudinaryResult.resource_type,
                            type: cloudinaryResult.type
                        }
                    );
                } catch (cleanupError) {
                    console.error("Cloudinary cleanup failed:", cleanupError);
                }
            }

            return res.status(500).json({
                message: "File upload failed"
            });
        }
    }
);



// Get all files uploaded by logged-in user
router.get("/my-files", authMiddleware, async (req, res) => {
    try {
        const files = await File.find({
            uploadedBy: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Files fetched successfully",
            files
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch files"
        });
    }
});
// Download a file from Cloudinary
router.get("/download/:id", authMiddleware, async (req, res) => {
    try {
        // Validate MongoDB file ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid file ID"
            });
        }

        // Check whether the logged-in user owns the file
        let file = await File.findOne({
            _id: req.params.id,
            uploadedBy: req.user.userId
        });

        // If not the owner, check sharing permission
        if (!file) {
            const share = await Share.findOne({
                file: req.params.id,
                sharedWith: req.user.userId,
                permission: "download"
            });

            if (!share) {
                return res.status(403).json({
                    message: "You do not have permission to download this file"
                });
            }

            // Check whether sharing has expired
            if (share.expiresAt && new Date() > share.expiresAt) {
                return res.status(403).json({
                    message: "This file share has expired"
                });
            }

            file = await File.findById(req.params.id);
        }

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        // Generate signed Cloudinary URL
        const cloudinaryUrl = getCloudinaryDeliveryUrl(file);

        // Fetch file from Cloudinary
        const cloudinaryResponse = await fetch(cloudinaryUrl);

        if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
            const detail = await cloudinaryResponse.text().catch(() => "");
            console.error(
                "Cloudinary download response:",
                cloudinaryResponse.status,
                detail
            );

            throw new Error(
                `Unable to retrieve file from Cloudinary (${cloudinaryResponse.status})`
            );
        }

        // Record download history
        await DownloadHistory.create({
            file: file._id,
            downloadedBy: req.user.userId
        });

        // Record activity
        await ActivityLog.create({
            user: req.user.userId,
            action: "DOWNLOAD",
            file: file._id,
            details: `File downloaded: ${file.originalName}`
        });

        // Set download headers
        res.setHeader("Content-Type", file.mimeType);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`
        );

        if (cloudinaryResponse.headers.get("content-length")) {
            res.setHeader(
                "Content-Length",
                cloudinaryResponse.headers.get("content-length")
            );
        }

        // Stream file to the user
        Readable.fromWeb(cloudinaryResponse.body).pipe(res);

    } catch (error) {
        console.error("File download error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "File download failed"
            });
        }

        res.destroy(error);
    }
});



// Delete a file
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        // Validate MongoDB file ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid file ID"
            });
        }

        // Find file belonging to logged-in user
        const file = await File.findOne({
            _id: req.params.id,
            uploadedBy: req.user.userId
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        // Delete file from Cloudinary or local storage
        if (file.cloudinaryPublicId) {
            const result = await cloudinary.uploader.destroy(
                file.cloudinaryPublicId,
                {
                    resource_type: file.cloudinaryResourceType || "image",
                    invalidate: true
                }
            );

            if (result.result !== "ok" && result.result !== "not found") {
                throw new Error("Cloudinary file deletion failed");
            }
        } else {
            // Fallback for older locally stored files
            try {
                await fs.unlink(file.filePath);
            } catch (error) {
                if (error.code !== "ENOENT") {
                    throw error;
                }
            }
        }

        // Create activity log
        await ActivityLog.create({
            user: req.user.userId,
            action: "DELETE",
            file: file._id,
            details: `File deleted: ${file.originalName}`
        });

        // Delete file record
        await File.deleteOne({
            _id: file._id
        });

        // Delete associated shares
        await Share.deleteMany({
            file: file._id
        });

        // Delete associated download history
        await DownloadHistory.deleteMany({
            file: file._id
        });

        return res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.error("File deletion error:", error);

        return res.status(500).json({
            message: "File deletion failed"
        });
    }
});




// Share a file with another user
router.post("/share", authMiddleware, async (req, res) => {
    try {
        const { fileId, email, permission, expiresAt } = req.body;

        // Validate required fields
        if (
            !fileId ||
            !email ||
            typeof email !== "string"
        ) {
            return res.status(400).json({
                message: "fileId and a valid email are required"
            });
        }

        // Validate file ID
        if (!/^[0-9a-fA-F]{24}$/.test(fileId)) {
            return res.status(400).json({
                message: "Invalid file ID"
            });
        }

        // Validate permission
        if (
            permission !== undefined &&
            !["view", "download"].includes(permission)
        ) {
            return res.status(400).json({
                message: "Permission must be either view or download"
            });
        }

        // Validate expiry date
        let validExpiryDate = null;

        if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
            if (typeof expiresAt !== "string") {
                return res.status(400).json({
                    message: "Invalid expiry date"
                });
            }

            const parsedDate = new Date(expiresAt);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid expiry date"
                });
            }

            if (parsedDate <= new Date()) {
                return res.status(400).json({
                    message: "Expiry date must be in the future"
                });
            }

            validExpiryDate = parsedDate;
        }

        // Normalize recipient email
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // Check that the file belongs to the logged-in user
        const file = await File.findOne({
            _id: fileId,
            uploadedBy: req.user.userId
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found or you are not the owner"
            });
        }

        // Find the recipient
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        // Prevent sharing with yourself
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot share a file with yourself"
            });
        }

        // Check for an existing share
        const existingShare = await Share.findOne({
            file: fileId,
            sharedWith: user._id
        });

        if (existingShare) {
            return res.status(400).json({
                message: "File is already shared with this user"
            });
        }

        // Create share
        const share = await Share.create({
            file: fileId,
            sharedBy: req.user.userId,
            sharedWith: user._id,
            permission: permission || "download",
            expiresAt: validExpiryDate
        });

        // Create activity log
        await ActivityLog.create({
            user: req.user.userId,
            action: "SHARE",
            file: file._id,
            details: `File shared with ${user.email}`
        });

        return res.status(201).json({
            message: "File shared successfully",
            share
        });

    } catch (error) {
        console.error("File sharing error:", error);

        return res.status(500).json({
            message: "File sharing failed"
        });
    }
});


// Get files shared with logged-in user

 // Get files shared with logged-in user
router.get("/shared-with-me", authMiddleware, async (req, res) => {
    try {
        

        const shares = await Share.find({
            sharedWith: req.user.userId
        })
            .populate("file")
            .populate("sharedBy", "name email")
            .sort({ createdAt: -1 });

        

        res.status(200).json({
            message: "Shared files fetched successfully",
            shares
        });

    } catch (error) {
       console.error("Shared files fetch error:", error);

        res.status(500).json({
            message: "Failed to fetch shared files"
        });
    }
});


// Get files shared by logged-in user

router.get("/shared-by-me", authMiddleware, async (req, res) => {
    try {
        // STEP 1: Check which user is logged in
       

        const shares = await Share.find({
            sharedBy: req.user.userId
        })
        .populate("file")
        .populate("sharedWith", "name email")
        .sort({ createdAt: -1 });

      

        res.status(200).json({
            message: "Shared files fetched successfully",
            shares
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch shared files"
        });
    }
});

// Change file share permission
router.patch("/change-permission/:shareId", authMiddleware, async (req, res) => {
    try {

        // Validate MongoDB share ID
if (!/^[0-9a-fA-F]{24}$/.test(req.params.shareId)) {
    return res.status(400).json({
        message: "Invalid share ID"
    });
}
        const { permission } = req.body;

        // Check permission value
        if (!permission || !["view", "download"].includes(permission)) {
            return res.status(400).json({
                message: "Permission must be either view or download"
            });
        }

        // Find the share and make sure logged-in user is the owner
        const share = await Share.findOne({
            _id: req.params.shareId,
            sharedBy: req.user.userId
        });

        if (!share) {
            return res.status(404).json({
                message: "Share not found or you are not the owner"
            });
        }

        // Update permission
        share.permission = permission;

        await share.save();

        await ActivityLog.create({
    user: req.user.userId,
    action: "CHANGE_PERMISSION",
    file: share.file,
    details: `Permission changed to ${permission}`
});

        res.status(200).json({
            message: "Share permission updated successfully",
            share
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to update share permission"
        });
    }
});

// Revoke file share
router.delete("/revoke-share/:shareId", authMiddleware, async (req, res) => {
    try {
               // Validate MongoDB share ID
if (!/^[0-9a-fA-F]{24}$/.test(req.params.shareId)) {
    return res.status(400).json({
        message: "Invalid share ID"
    });
}
        // Find the share and make sure the logged-in user is the owner
        const share = await Share.findOne({
            _id: req.params.shareId,
            sharedBy: req.user.userId
        });

        if (!share) {
            return res.status(404).json({
                message: "Share not found or you are not the owner"
            });
        }

        // Delete the share
        await Share.deleteOne({
            _id: share._id
        });

        await ActivityLog.create({
    user: req.user.userId,
    action: "REVOKE_SHARE",
    file: share.file,
    details: "File share revoked"
});

        res.status(200).json({
            message: "File share revoked successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to revoke file share"
        });
    }
});

// Get download history for files owned by logged-in user
router.get("/download-history", authMiddleware, async (req, res) => {
    try {
        
        // Find files owned by the logged-in user
        const files = await File.find({
            uploadedBy: req.user.userId
        }).select("_id");

        const fileIds = files.map(file => file._id);
        

        // Find download records for those files
        const history = await DownloadHistory.find({
            file: { $in: fileIds }
        })
        .populate("file", "originalName")
        .populate("downloadedBy", "name email")
        .sort({ downloadedAt: -1 });

        res.status(200).json({
            message: "Download history fetched successfully",
            history
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch download history"
        });
    }
});

// Search and filter user's files
router.get("/search", authMiddleware, async (req, res) => {
    try {
        const { name, mimeType, sort } = req.query;

        const query = {
            uploadedBy: req.user.userId
        };

        // Search by filename
        // Search by filename safely
if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.originalName = {
        $regex: escapedName,
        $options: "i"
    };
}

        // Filter by file type
        if (mimeType) {
            query.mimeType = mimeType;
        }

        // Sort files
        let sortOption = { createdAt: -1 };

        if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const files = await File.find(query)
            .sort(sortOption);

        res.status(200).json({
            message: "Files fetched successfully",
            count: files.length,
            files
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "File search failed"
        });
    }
});



// Get details of a single file
router.get("/details/:id", authMiddleware, async (req, res) => {
    try {
        
        

        // Validate MongoDB file ID
        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            

            return res.status(400).json({
                message: "Invalid file ID"
            });
        }

        const file = await File.findOne({
            _id: req.params.id,
            uploadedBy: req.user.userId
        }).populate("uploadedBy", "name email");

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const downloadCount = await DownloadHistory.countDocuments({
            file: file._id
        });

        const shares = await Share.find({
            file: file._id,
            sharedBy: req.user.userId
        }).populate("sharedWith", "name email");

        return res.status(200).json({
            message: "File details fetched successfully",
            file,
            downloadCount,
            shares
        });

    } catch (error) {
        console.error("DETAILS ROUTE ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch file details"
        });
    }
});






// ✅ Activity Logs route
router.get("/activity-logs", authMiddleware, async (req, res) => {
    try {

        const logs = await ActivityLog.find({
            user: req.user.userId
        })
            .populate("file", "originalName")
            .sort({ createdAt: -1 });

        res.json({
            logs
        });

    } catch (error) {

        console.error("ACTIVITY LOG ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch activity logs"
        });
    }
});

router.get("/view/:id", authMiddleware, async (req, res) => {
    try {
        // Validate MongoDB file ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid file ID"
            });
        }

        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        // Owner can always view
        const isOwner =
            file.uploadedBy.toString() === req.user.userId;

        if (!isOwner) {
            // Check whether file is shared with current user
            const share = await Share.findOne({
                file: file._id,
                sharedWith: req.user.userId
            });

            if (!share) {
                return res.status(403).json({
                    message: "You do not have access to this file"
                });
            }

            // Check expiry
            if (
                share.expiresAt &&
                new Date() > new Date(share.expiresAt)
            ) {
                return res.status(403).json({
                    message: "File share has expired"
                });
            }

            // Both VIEW and DOWNLOAD can view
            if (
                share.permission !== "view" &&
                share.permission !== "download"
            ) {
                return res.status(403).json({
                    message: "View permission denied"
                });
            }
        }

        // Check Cloudinary URL
        if (!file.cloudinaryUrl) {
            return res.status(404).json({
                message: "Cloudinary file not found"
            });
        }

        // Fetch file from Cloudinary
        const cloudinaryResponse = await fetch(file.cloudinaryUrl);

        if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
            throw new Error("Unable to retrieve file from Cloudinary");
        }

        // Set preview headers
        res.setHeader("Content-Type", file.mimeType);
        res.setHeader(
            "Content-Disposition",
            `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`
        );

        // Stream file to browser
        Readable.fromWeb(cloudinaryResponse.body).pipe(res);

    } catch (error) {
        console.error("VIEW FILE ERROR:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "Failed to view file"
            });
        }

        res.destroy(error);
    }
});


module.exports = router;




