import { Injectable } from '@nestjs/common';
import { LyricsService } from '../lyrics/lyrics.service';
import { MinimaxService } from '../minimax/minimax.service';
import { SongHistoryService } from './song-history.service';

@Injectable()
export class SongService {
  constructor(
    private readonly minimax: MinimaxService,
    private readonly lyricsService: LyricsService,
    private readonly history: SongHistoryService,
  ) {}

  async generateLyrics(prompt: string) {
    const lyrics = await this.lyricsService.generate(prompt);
    return { lyrics };
  }

  async generate(
    body: { prompt: string; lyrics?: string; vocalType?: string; version?: string },
    ip: string,
  ) {
    const instrumental = body.vocalType === 'instrumental';
    const lyrics = instrumental
      ? ''
      : body.lyrics?.trim() || (await this.lyricsService.generate(body.prompt));

    const id = Date.now();
    const name = `Auto Music #${String(id).slice(-4)}`;

    const result = await this.minimax.generateMusic(body.prompt, lyrics, body.vocalType);
    return {
      id,
      name,
      songTitle: name,
      styleTags: body.prompt,
      lyrics,
      audioUrl: result.audioUrl,
    };
  }

  getTaskStatus(taskId: string) {
    return this.minimax.getTaskStatus(taskId);
  }

  listHistory(ip: string, page: number, limit: number) {
    return this.history.listByIp(ip, page, limit);
  }
}
