import DOMPurify from "dompurify";

const BlogContent = ({ content }) => {
  if (!content) return null;

  const hasHtml = /<\s*\/?\s*(p|div|strong|b|em|i|u|ul|ol|li|a|img|br|h[1-6])[\s>]/i.test(
    content
  );

  if (hasHtml) {
    const cleanHtml = DOMPurify.sanitize(content, {
      USE_PROFILES: {
        html: true,
      },
      ADD_ATTR: ["target", "rel"],
    });

    return (
      <div
        className="blog-content leading-7 text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_br]:leading-7 [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_strong]:font-semibold [&_u]:underline [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{
          __html: cleanHtml,
        }}
      />
    );
  }

  const markdownImageRegex =
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);

      if (text.trim()) {
        parts.push(
          <p
            key={key++}
            className="mb-3 whitespace-pre-line leading-relaxed"
          >
            {text.trim()}
          </p>
        );
      }
    }

    parts.push(
      <img
        key={key++}
        src={match[2]}
        alt={match[1] || "Blog image"}
        className="my-4 w-full rounded-lg border"
      />
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);

    if (text.trim()) {
      parts.push(
        <p
          key={key++}
          className="mb-3 whitespace-pre-line leading-relaxed"
        >
          {text.trim()}
        </p>
      );
    }
  }

  return (
    <div className="blog-content leading-7 text-gray-700">
      {parts}
    </div>
  );
};

export default BlogContent;