import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { getDataDir, getDataFile } from '../data-path';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface MinimaxTaskParams {
  prompt: string;
  lyrics: string;
  instrumental: boolean;
}

export interface StoredTask {
  id: string;
  provider: 'minimax';
  status: TaskStatus;
  params: MinimaxTaskParams;
  audioUrl?: string;
  error?: string;
  createdAt: string;
}

@Injectable()
export class TaskStoreService {
  private file() {
    return getDataFile('tasks.json');
  }

  private load(): StoredTask[] {
    const dir = getDataDir();
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const file = this.file();
    if (!existsSync(file)) return [];
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    return Array.isArray(data) ? data : [];
  }

  private save(list: StoredTask[]) {
    writeFileSync(this.file(), JSON.stringify(list, null, 2));
  }

  create(task: StoredTask) {
    const list = this.load();
    list.unshift(task);
    this.save(list);
  }

  get(id: string) {
    return this.load().find((t) => t.id === id);
  }

  trySetStatus(id: string, from: TaskStatus, to: TaskStatus) {
    const list = this.load();
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0 || list[idx].status !== from) return false;
    list[idx].status = to;
    this.save(list);
    return true;
  }

  update(id: string, patch: Partial<StoredTask>) {
    const list = this.load();
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0) return;
    list[idx] = { ...list[idx], ...patch };
    this.save(list);
  }
}
