import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

// Le contenu est généré par notre pipeline (pas de HTML brut externe),
// mais on neutralise toute balise <script> ou attribut on* par prudence.
function sanitize(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

// Les liens Amazon (affiliés) rendus dans le contenu sont marqués
// target="_blank" + rel="nofollow sponsored noopener", comme les CTA.
function markAmazonLinks(html) {
  return html.replace(
    /<a href="(https:\/\/(?:www\.)?amazon\.ca\/[^"]*|https:\/\/amzn\.to\/[^"]*)">/g,
    (m, href) => `<a href="${href}" target="_blank" rel="nofollow sponsored noopener">`
  );
}

export function renderMarkdown(md) {
  const html = marked.parse(String(md || ''));
  return markAmazonLinks(sanitize(html));
}

export function stripMarkdown(md) {
  return String(md || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}