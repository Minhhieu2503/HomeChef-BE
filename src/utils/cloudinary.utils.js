const cloudinary = require("../config/cloudinary");

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer The file buffer from multer
 * @param {string} folder The target folder in cloudinary
 */
const uploadToCloudinary = (buffer, folder = "homechef/avatars") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Finish the pipe using buffer
    uploadStream.end(buffer);
  });
};

module.exports = { uploadToCloudinary };
