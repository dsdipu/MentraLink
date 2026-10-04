const cloudinary = require("../config/cloudinary");

const ID_CARD_FOLDER = "mentralink/id-cards";

// Upload as an "authenticated" asset: it can NOT be opened with a plain public URL,
// only through a signed URL that the server generates for admins.
const uploadIdCard = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: ID_CARD_FOLDER,
        resource_type: "image",
        type: "authenticated",
        transformation: [{ width: 1600, crop: "limit" }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

const getIdCardUrl = (publicId) =>
  publicId
    ? cloudinary.url(publicId, {
        resource_type: "image",
        type: "authenticated",
        sign_url: true,
        secure: true,
      })
    : null;

// Returns true when the image is gone (deleted now or already missing).
const deleteIdCard = async (publicId) => {
  if (!publicId) return true;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "authenticated",
      invalidate: true,
    });
    return result.result === "ok" || result.result === "not found";
  } catch (err) {
    console.error(`Failed to delete ID card ${publicId}:`, err.message);
    return false;
  }
};

module.exports = { uploadIdCard, getIdCardUrl, deleteIdCard };
