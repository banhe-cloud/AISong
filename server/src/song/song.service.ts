import { Injectable } from '@nestjs/common';
import { LyricsService } from '../lyrics/lyrics.service';
import { PiapiService } from '../piapi/piapi.service';
import { SongHistoryService } from './song-history.service';

@Injectable()
export class SongService {
  constructor(
    private readonly piapi: PiapiService,
    private readonly lyricsService: LyricsService,
    private readonly history: SongHistoryService,
  ) {}

  async generate(body: { prompt: string }, ip: string) {
    const lyrics = await this.lyricsService.generate(body.prompt);
    const musicRes = await this.piapi.generateMusic(body.prompt, lyrics);

    const id = Date.now();
    const name = `Auto Music #${String(id).slice(-4)}`;

    const result = {
      id,
      name,
      songTitle: name,
      styleTags: body.prompt,
      lyrics,
      audioUrl: musicRes.audioUrl,
      taskId: musicRes.taskId,
      taskType: musicRes.taskType,
    };

    this.history.add({
      id,
      ip,
      name,
      prompt: body.prompt,
      audioUrl: musicRes.audioUrl,
      taskId: musicRes.taskId,
      taskType: musicRes.taskType,
      createdAt: new Date().toISOString(),
    });

    return result;
  }

  listHistory(ip: string, page: number, limit: number) {
    return this.history.listByIp(ip, page, limit);
  }
}
