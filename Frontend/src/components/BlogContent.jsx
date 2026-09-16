// Parses content for ![alt](url) markers (inserted by the "Insert image here"
// button) and renders real <img> tags at those exact positions, with the
// surrounding text rendered normally around them.
const BlogContent = ({ content }) => {
  if (!content) return null;

  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      if (text.trim()) {
        parts.push(<p key={key++} className="whitespace-pre-line mb-3 leading-relaxed">{text.trim()}</p>);
      }
    }
    parts.push(
      <img
        key={key++}
        src={match[2]}
        alt={match[1] || "Blog image"}
        className="w-full rounded-lg my-4 border"
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    if (text.trim()) {
      parts.push(<p key={key++} className="whitespace-pre-line mb-3 leading-relaxed">{text.trim()}</p>);
    }
  }

  return <div>{parts}</div>;
};

export default BlogContent;