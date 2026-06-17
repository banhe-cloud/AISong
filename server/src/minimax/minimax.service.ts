import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { cleanLyricBody } from '../lyrics/lyrics-clean';
import { TaskStoreService } from '../task/task-store.service';

@Injectable()
export class MinimaxService {
  private baseUrl = process.env.MINIMAX_API_BASE || 'https://api.minimax.io';
  private apiKey = process.env.MINIMAX_API_KEY;
  private model = process.env.MINIMAX_MODEL || 'music-2.6';

  constructor(private readonly taskStore: TaskStoreService) {}

  async generateMusic(prompt: string, lyrics: string, vocalType?: string) {
    if (!this.apiKey) {
      throw new HttpException('MINIMAX_API_KEY not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const instrumental = vocalType === 'instrumental';
    const audioUrl = await this.generateAudio({ prompt, lyrics, instrumental });
    return { audioUrl };
  }

  async createMusicTask(prompt: string, lyrics: string, vocalType?: string) {
    if (!this.apiKey) {
      throw new HttpException('MINIMAX_API_KEY not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const instrumental = vocalType === 'instrumental';
    const taskId = `mm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.taskStore.create({
      id: taskId,
      provider: 'minimax',
      status: 'pending',
      params: {
        prompt,
        lyrics,
        instrumental,
      },
      createdAt: new Date().toISOString(),
    });
    return { taskId };
  }

  async getTaskStatus(taskId: string) {
    const task = this.taskStore.get(taskId);
    if (!task) {
      throw new HttpException('task not found', HttpStatus.NOT_FOUND);
    }
    if (task.status === 'completed') {
      return { status: 'completed', audioUrl: task.audioUrl };
    }
    if (task.status === 'failed') {
      return { status: 'failed', error: task.error || 'task failed' };
    }
    if (task.status === 'processing') {
      return { status: 'processing' };
    }
    if (!this.taskStore.trySetStatus(taskId, 'pending', 'processing')) {
      const latest = this.taskStore.get(taskId);
      if (latest?.status === 'completed') {
        return { status: 'completed', audioUrl: latest.audioUrl };
      }
      if (latest?.status === 'failed') {
        return { status: 'failed', error: latest.error || 'task failed' };
      }
      return { status: 'processing' };
    }
    try {
      const audioUrl = await this.generateAudio(task.params);
      this.taskStore.update(taskId, { status: 'completed', audioUrl });
      return { status: 'completed', audioUrl };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'task failed';
      this.taskStore.update(taskId, { status: 'failed', error });
      return { status: 'failed', error };
    }
  }

  private async generateAudio(params: { prompt: string; lyrics: string; instrumental: boolean }) {
    const payload: Record<string, unknown> = {
      model: this.model,
      prompt: params.prompt.slice(0, 2000),
      output_format: 'url',
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: 'mp3',
      },
    };
    if (params.instrumental) {
      payload.is_instrumental = true;
    } else {
      const lyrics = this.formatLyricsForMinimax(params.lyrics);
      if (lyrics) {
        payload.lyrics = lyrics;
      } else {
        payload.lyrics_optimizer = true;
      }
    }
    console.log('[Minimax] generateAudio', { model: this.model, instrumental: params.instrumental });
    console.log('[Minimax] payload:', JSON.stringify(payload, null, 2));
    try {
      const res = await fetch(`${this.baseUrl}/v1/music_generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
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
          data.base_resp?.status_msg || 'minimax request failed',
          HttpStatus.BAD_GATEWAY,
        );
      }
      const audio = data.data?.audio;
      if (data.data?.status !== 2 || !audio || typeof audio !== 'string') {
        throw new HttpException('minimax audio not ready', HttpStatus.BAD_GATEWAY);
      }
      if (!audio.startsWith('http')) {
        throw new HttpException('minimax returned non-url audio', HttpStatus.BAD_GATEWAY);
      }
      return audio;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        err instanceof Error ? err.message : 'fetch failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private formatLyricsForMinimax(lyrics: string) {
    const lines = lyrics
      .split('\n')
      .map((l) => {
        const m = l.trim().match(/^\[\d{2}:\d{2}\.\d{2}\]\s*(.*)$/);
        return cleanLyricBody(m ? m[1] : l);
      })
      .filter(Boolean);
    if (!lines.length) return '';
    return `[Verse]\n${lines.join('\n')}`;
  }
}
