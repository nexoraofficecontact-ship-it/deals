import { renderMarkdown } from '../lib/markdown.js';

export default function Markdown({ children }) {
  const html = renderMarkdown(children);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
