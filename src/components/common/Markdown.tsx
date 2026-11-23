"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function safeUrl(uri: string): string {
  const trimmed = (uri || "").trim();
  if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) return trimmed;
  return "#";
}

export function Markdown({ content, className = "" }: { content?: string | null; className?: string }) {
  if (!content?.trim()) return null;
  return (
    <div className={`prose-hacksyra ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={safeUrl}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={safeUrl(href ?? "")} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

