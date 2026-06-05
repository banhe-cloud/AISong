function isBracketTag(text: string) {
  const t = text.trim();
  return /^\[[^\]]+\]$/.test(t) && !/^\[\d{2}:\d{2}\.\d{2}\]$/.test(t);
}

function stripBracketPrefix(text: string) {
  let t = text.trim();
  while (/^\[[^\]]+\]/.test(t) && !/^\[\d{2}:\d{2}\.\d{2}\]/.test(t)) {
    t = t.replace(/^\[[^\]]+\]\s*/, '').trim();
  }
  return t;
}

export function cleanLyricBody(text: string) {
  const t = stripBracketPrefix(text);
  if (!t || isBracketTag(t)) return '';
  return t;
}

export function cleanLyricsForModel(lyrics: string) {
  return lyrics
    .split('\n')
    .map((l) => {
      const m = l.trim().match(/^(\[\d{2}:\d{2}\.\d{2}\])\s*(.*)$/);
      if (m) {
        const cleaned = cleanLyricBody(m[2]);
        return cleaned ? `${m[1]} ${cleaned}` : '';
      }
      return cleanLyricBody(l);
    })
    .filter(Boolean)
    .join('\n');
}
