// const multer = require("multer");
// const CloudinaryStorage = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "mentralink/profiles",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//     transformation: [{ width: 500, height: 500, crop: "fill" }],
//   },
// });

// const profileUpload = multer({
//   storage,
//   limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
// });

// module.exports = profileUpload;



const multer = require("multer");

const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }
  },
});

module.exports = profileUpload;