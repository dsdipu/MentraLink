const { detectImageType } = require("../utils/imageSignature");

const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err.message || "File upload failed" });
    }

    // the file must really be an image, whatever its name or declared type says
    const files = [req.file, ...(Array.isArray(req.files) ? req.files : [])].filter(Boolean);
    for (const file of files) {
      const realType = file.buffer ? detectImageType(file.buffer) : null;
      if (!realType) {
        return res.status(400).json({ message: "The uploaded file is not a valid image" });
      }
      file.mimetype = realType;
    }

    next();
  });
};

module.exports = handleUpload;