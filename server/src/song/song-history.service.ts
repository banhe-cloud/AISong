import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface StoredSong {
  id: number;
  ip: string;
  name: string;
  prompt: string;
  audioUrl: string;
  taskId?: string;
  taskType?: string;
  createdAt: string;
}

const SONGS_FILE = join(process.cwd(), 'data', 'songs.json');

@Injectable()
export class SongHistoryService {
  add(song: StoredSong) {
    const list = this.load();
    list.unshift(song);
    this.save(list);
  }

  listByIp(ip: string, page: number, limit: number) {
    const all = this.load().filter((s) => s.ip === ip);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;
    const items = all.slice(start, start + limit);
    return { items, total, page: safePage, limit, totalPages };
  }

  private load(): StoredSong[] {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(SONGS_FILE)) return [];
    const data = JSON.parse(readFileSync(SONGS_FILE, 'utf-8'));
    return Array.isArray(data) ? data : [];
  }

  private save(list: StoredSong[]) {
    writeFileSync(SONGS_FILE, JSON.stringify(list, null, 2));
  }
}
