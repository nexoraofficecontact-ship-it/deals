// Extraction des questions/réponses depuis le markdown généré.
// Ne fabrique rien : si aucune paire Q/R n'est trouvée, retourne [].
export function extractFaq(markdown) {
  const md = String(markdown || '');
  const start = md.indexOf('## Questions fréquentes');
  if (start === -1) return [];
  const after = md.slice(start);
  const nextH2 = after.indexOf('\n## ', 1);
  const section = nextH2 === -1 ? after : after.slice(0, nextH2);
  const lines = section.split(/\r?\n/);
  const items = [];
  let current = null;
  for (const line of lines) {
    const q = line.match(/^###\s+(.+)$/);
    if (q) {
      if (current) items.push(current);
      current = { question: q[1].trim(), answer: '' };
      continue;
    }
    if (current && line.trim() && !line.startsWith('#')) {
      current.answer = `${current.answer} ${line.trim()}`.trim();
    }
  }
  if (current) items.push(current);
  return items.filter((i) => i.question && i.answer);
}
