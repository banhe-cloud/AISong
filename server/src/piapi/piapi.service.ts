import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class PiapiService {
  private baseUrl = process.env.PIAPI_API_BASE || 'https://api.piapi.ai';
  private apiKey = process.env.PIAPI_API_KEY;
  private taskType = process.env.PIAPI_TASK_TYPE || 'txt2audio-base';

  private headers() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  private async post(path: string, body: object) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    return res.json();
  }

  private async get(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers() });
    return res.json();
  }

  async generateMusic(prompt: string, lyrics: string) {
    if (!lyrics?.trim() || lyrics.trim() === '[inst]') {
      throw new HttpException('lyrics required for vocal track', HttpStatus.BAD_REQUEST);
    }
    const stylePrompt = `${prompt}, vocal, singing voice, with vocals`;
    const createRes = await this.post('/api/v1/task', {
      model: 'Qubico/diffrhythm',
      task_type: this.taskType,
      input: {
        lyrics,
        style_prompt: stylePrompt,
        style_audio: '',
      },
      config: {
        webhook_config: { endpoint: '', secret: '' },
      },
    });

    if (createRes.code !== 200) {
      throw new HttpException(
        createRes.message || 'create task failed',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const taskId = createRes.data?.task_id;
    if (!taskId) {
      throw new HttpException('no task_id returned', HttpStatus.BAD_GATEWAY);
    }

    return this.pollTask(taskId);
  }

  private async pollTask(taskId: string) {
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await this.get(`/api/v1/task/${taskId}`);
      if (res.code !== 200) {
        throw new HttpException(res.message || 'get task failed', HttpStatus.BAD_GATEWAY);
      }
      const status = String(res.data?.status || '').toLowerCase();
      if (status === 'completed') {
        const audioUrl = this.extractAudioUrl(res.data?.output);
        if (!audioUrl) {
          throw new HttpException('no audio url in output', HttpStatus.BAD_GATEWAY);
        }
        return { taskId, audioUrl, taskType: res.data?.task_type };
      }
      if (status === 'failed') {
        throw new HttpException(
          res.data?.error?.message || 'task failed',
          HttpStatus.BAD_GATEWAY,
        );
      }
    }
    throw new HttpException('task timeout', HttpStatus.GATEWAY_TIMEOUT);
  }

  private extractAudioUrl(output: unknown): string | null {
    if (!output || typeof output !== 'object') return null;
    const o = output as Record<string, unknown>;
    if (typeof o.audio_url === 'string') return o.audio_url;
    if (typeof o.audio === 'string') return o.audio;
    for (const v of Object.values(o)) {
      if (typeof v === 'string' && (v.startsWith('http') || v.endsWith('.mp3'))) return v;
      if (v && typeof v === 'object') {
        const nested = this.extractAudioUrl(v);
        if (nested) return nested;
      }
    }
    return null;
  }
}
