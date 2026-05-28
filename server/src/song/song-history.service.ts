import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { getDataDir, getDataFile } from '../data-path';

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
    const dir = getDataDir();
    const file = getDataFile('songs.json');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(file)) return [];
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    return Array.isArray(data) ? data : [];
  }

  private save(list: StoredSong[]) {
    writeFileSync(getDataFile('songs.json'), JSON.stringify(list, null, 2));
  }
}
