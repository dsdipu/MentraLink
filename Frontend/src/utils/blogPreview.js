// Used only for the short preview snippet on blog list cards, so the raw
// ![image](url) syntax doesn't show up as ugly text in the card.
export const previewText = (content, maxLength = 140) => {
  if (!content) return "";
  const stripped = content.replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim();
  return stripped.length > maxLength ? stripped.slice(0, maxLength) + "..." : stripped;
};