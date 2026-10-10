// Only absolute http(s) URLs may be used as a link or image source.
// `javascript:`, `data:` and similar URLs return "" so they can never run code when clicked.
export const safeUrl = (value) => {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
};
