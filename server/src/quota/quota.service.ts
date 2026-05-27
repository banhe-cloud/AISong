import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const DAILY_LIMIT = 5;
const QUOTA_FILE = join(process.cwd(), 'data', 'ip-quota.json');

@Injectable()
export class QuotaService {
  getQuota(ip: string) {
    const today = new Date().toISOString().slice(0, 10);
    const data = this.load();
    const used = data[today]?.[ip] || 0;
    return { limit: DAILY_LIMIT, used, remaining: Math.max(0, DAILY_LIMIT - used) };
  }

  checkAndConsume(ip: string) {
    const today = new Date().toISOString().slice(0, 10);
    const data = this.load();
    if (!data[today]) data[today] = {};
    const count = data[today][ip] || 0;
    if (count >= DAILY_LIMIT) {
      throw new HttpException(
        `Daily limit reached (${DAILY_LIMIT} songs per IP)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    data[today][ip] = count + 1;
    this.save(data);
  }

  private load(): Record<string, Record<string, number>> {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(QUOTA_FILE)) return {};
    return JSON.parse(readFileSync(QUOTA_FILE, 'utf-8'));
  }

  private save(data: Record<string, Record<string, number>>) {
    writeFileSync(QUOTA_FILE, JSON.stringify(data, null, 2));
  }
}
