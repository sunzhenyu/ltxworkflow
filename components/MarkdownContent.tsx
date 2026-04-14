"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-white mb-4 mt-8 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mb-3 mt-6">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold text-white mb-2 mt-4">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 leading-relaxed mb-4">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="ml-4">{children}</li>
        ),
        code: ({ inline, children, ...props }: any) => {
          return inline ? (
            <code className="bg-gray-800 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code {...props} className="block bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-4">{children}</pre>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-violet-400 hover:text-violet-300 underline"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-violet-600 pl-4 italic text-gray-400 mb-4">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-700">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-800">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-700">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr>{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold text-white">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-gray-300">
            {children}
          </td>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="rounded-lg mb-4 max-w-full h-auto"
          />
        ),
        hr: () => (
          <hr className="border-gray-700 my-6" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
