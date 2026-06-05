import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { cleanLyricBody } from './lyrics-clean';

@Injectable()
export class LyricsService {
  private readonly maxSec = 95;

  async generate(prompt: string) {
    const aiLyrics = await this.fromAI(prompt);
    if (aiLyrics) return aiLyrics;
    throw new HttpException('Failed to generate lyrics', HttpStatus.BAD_GATEWAY);
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
              'You are an award-winning English songwriter. Write lyrics that sound like real hit songs — catchy, emotional, and easy to sing.',
          },
          {
            role: 'user',
            content: `Write song lyrics for: ${prompt}

Prioritize quality: strong chorus hook, vivid imagery, natural rhythm, emotional pull. Match the genre and mood.

Verse-chorus song, repeat the chorus. One lyric line per line. Keep it short enough to sing within 1:35.

English only. Plain lyrics only. No timestamps, titles, section labels like [Verse] or (Chorus), or explanations.`,
          },
        ],
        temperature: 0.9,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const plain = this.parsePlainLyrics(text);
    if (plain.length < 4) return null;

    const timed = this.toTimedLyrics(plain);
    return timed.split('\n').filter(Boolean).length >= 6 ? timed : null;
  }

  private parsePlainLyrics(text: string) {
    return text
      .split('\n')
      .map((l) =>
        cleanLyricBody(
          l.replace(/^[-*\d.]+\s*/, '').replace(/^\[\d{2}:\d{2}\.\d{2}\]\s*/, ''),
        ),
      )
      .filter((l) => l && l.length < 80);
  }

  private stamp(sec: number, line: string) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.00] ${line}`;
  }

  private toTimedLyrics(lines: string[]) {
    let sec = 10;
    const out: string[] = [];
    for (const line of lines) {
      if (sec > this.maxSec) break;
      out.push(this.stamp(sec, line));
      sec += 6;
    }
    return out.join('\n');
  }
}
