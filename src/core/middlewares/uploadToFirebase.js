const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid"); // To generate unique file names
const { AppError } = require("../utils/errorHandler");

const uploadToFirebase = async (req, res, next) => {
  try {
    const bucket = admin.storage().bucket();

    if (!req.file || !req.file.buffer) {
      return next();
    }

    const uniqueFilename = `ai-employees/${uuidv4()}-${req.file.filename}`;
    const blob = bucket.file(uniqueFilename);

    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: req.file.mimeType,
      },
    });

    // Create a promise to handle the upload and make the file public
    await new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        reject(new AppError("Failed to upload file to Firebase", 500));
      });

      blobStream.on("finish", async () => {
        try {
          await blob.makePublic();
          req.body.imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve();
        } catch (err) {
          reject(new AppError("Failed to make file public", 500));
        }
      });

      blobStream.end(req.file.buffer); // Write the buffer to the stream
    });

    next(); // Proceed to the next middleware
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadToFirebase };
