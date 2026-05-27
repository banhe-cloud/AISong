import { Injectable } from '@nestjs/common';

@Injectable()
export class LyricsService {
  async generate(prompt: string) {
    const aiLyrics = await this.fromAI(prompt);
    if (aiLyrics) return aiLyrics;
    return this.fallbackLyrics(prompt);
  }

  private async fromAI(prompt: string) {
    const key = process.env.LLM_API_KEY || process.env.PIAPI_API_KEY;
    if (!key) return null;

    const base = process.env.LLM_API_BASE || 'https://api.piapi.ai/v1';
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional English songwriter. Always write lyrics in English only.',
          },
          {
            role: 'user',
            content: `Write English lyrics for: ${prompt}

Rules:
- Lyrics MUST be in English only (no Chinese or other languages)
- Output 10-12 lines ONLY
- Each line MUST be: [mm:ss.xx] lyric text
- Start at [00:10.00], each next line +7 seconds (e.g. [00:17.00], [00:24.00])
- Include verse and chorus feel, suitable for singing
- No titles, no explanation, no markdown`,
          },
        ],
        temperature: 0.9,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const timed = this.parseTimedLyrics(text);
    if (timed) return timed;

    const plain = text
      .split('\n')
      .map((l) => l.replace(/^[-*\d.]+\s*/, '').trim())
      .filter((l) => l && !l.startsWith('[') && l.length < 80);
    if (plain.length >= 4) return this.toTimedLyrics(plain);
    return null;
  }

  private parseTimedLyrics(text: string) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^\[\d{2}:\d{2}\.\d{2}\]/.test(l));
    return lines.length >= 4 ? lines.join('\n') : null;
  }

  private fallbackLyrics(prompt: string) {
    const theme = prompt.trim().slice(0, 60) || 'tonight we shine';
    return this.toTimedLyrics([
      'Under the lights we start to move',
      'Hearts beat fast as the night comes alive',
      'We sing and dance we thrive',
      `Oh oh ${theme} in the fire tonight`,
      'Raise your voice into the sky',
      'This is our time to fly',
      'Every step echoes on the floor',
      'Hands up high never looking back',
      `Oh oh ${theme} burning bright`,
      'Raise your voice into the sky',
    ]);
  }

  private toTimedLyrics(lines: string[]) {
    let sec = 10;
    const out: string[] = [];
    for (const line of lines) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      out.push(`[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.00] ${line}`);
      sec += 7;
    }
    return out.join('\n');
  }
}
