import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class LyricsService {
  private baseUrl = process.env.MINIMAX_API_BASE || 'https://api.minimax.io';
  private apiKey = process.env.MINIMAX_API_KEY;

  async generate(prompt: string) {
    if (!this.apiKey) {
      throw new HttpException('MINIMAX_API_KEY not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    try {
      const lyrics = await this.generateFromMinimax(prompt);
      if (lyrics) return lyrics;
      throw new HttpException('Failed to generate lyrics', HttpStatus.BAD_GATEWAY);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        err instanceof Error ? err.message : 'Failed to generate lyrics',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async generateFromMinimax(prompt: string) {
    const res = await fetch(`${this.baseUrl}/v1/lyrics_generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        mode: 'write_full_song',
        prompt: prompt || undefined,
      }),
    });

    if (!res.ok) {
      throw new HttpException(
        `Minimax request failed with status ${res.status}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = await res.json();
    const code = data.base_resp?.status_code;
    if (code !== 0) {
      throw new HttpException(
        data.base_resp?.status_msg || 'minimax lyrics generation failed',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const lyrics = data.lyrics || '';
    if (!lyrics || lyrics.length < 20) {
      throw new HttpException('Generated lyrics too short', HttpStatus.BAD_GATEWAY);
    }

    return lyrics;
  }
}
