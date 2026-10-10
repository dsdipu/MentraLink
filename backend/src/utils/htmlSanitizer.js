const sanitizeHtml = require("sanitize-html");

const HTML_TAG_PATTERN = /<\s*\/?\s*(p|div|span|strong|b|em|i|u|s|ul|ol|li|a|img|br|hr|h[1-6]|blockquote|code|pre|script|style|iframe|svg|object|embed|form|input)[\s>\/]/i;

// Blog posts are written in a rich-text editor, so some HTML is expected. Everything that can run
// code (script, event handlers, javascript: links, iframes, styles ...) is removed before saving.
const sanitizeBlogContent = (content) => {
  const text = String(content ?? "");
  if (!HTML_TAG_PATTERN.test(text)) return text; // plain text / markdown is rendered as text, leave it untouched

  return sanitizeHtml(text, {
    allowedTags: [
      "p", "br", "hr", "div", "span", "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li", "a", "img", "h1", "h2", "h3", "h4", "blockquote", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
};

// Only absolute http(s) URLs are accepted (blocks javascript:, data:, vbscript: ...). Returns null otherwise.
const safeHttpUrl = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2000) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const cleanUrlList = (list, max = 20) =>
  (Array.isArray(list) ? list : []).map(safeHttpUrl).filter(Boolean).slice(0, max);

const cleanLinks = (links, max = 20) =>
  (Array.isArray(links) ? links : [])
    .map((link) => ({
      label: String(link?.label ?? "").trim().slice(0, 120),
      url: safeHttpUrl(link?.url),
    }))
    .filter((link) => link.url)
    .slice(0, max);

module.exports = { sanitizeBlogContent, safeHttpUrl, cleanUrlList, cleanLinks };
