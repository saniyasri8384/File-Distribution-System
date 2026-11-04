const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

console.log("Cloudinary configuration loaded:", {
    envApiKeyLoaded: !!process.env.CLOUDINARY_API_KEY,
    sdkApiKeyLoaded: !!cloudinary.config().api_key,
    envCloudNameLoaded: !!process.env.CLOUDINARY_CLOUD_NAME,
    envSecretLoaded: !!process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;