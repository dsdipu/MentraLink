// The browser-supplied MIME type can be faked, so look at the first bytes of the file.
const startsWith = (buffer, bytes, offset = 0) =>
  buffer.length >= offset + bytes.length && bytes.every((byte, i) => buffer[offset + i] === byte);

const detectImageType = (buffer) => {
  if (!Buffer.isBuffer(buffer)) return null;
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  return null;
};

module.exports = { detectImageType };
