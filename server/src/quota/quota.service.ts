import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { getDataDir, getDataFile } from '../data-path';

export const DAILY_LIMIT = 5;

const QUOTA_ENABLED = process.env.QUOTA_ENABLED === 'true';

@Injectable()
export class QuotaService {
  getQuota(ip: string) {
    if (!QUOTA_ENABLED) {
      return { limit: DAILY_LIMIT, used: 0, remaining: DAILY_LIMIT };
    }
    const today = new Date().toISOString().slice(0, 10);
    const data = this.load();
    const used = data[today]?.[ip] || 0;
    return { limit: DAILY_LIMIT, used, remaining: Math.max(0, DAILY_LIMIT - used) };
  }

  checkAndConsume(ip: string) {
    if (!QUOTA_ENABLED) return;
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
    const dir = getDataDir();
    const file = getDataFile('ip-quota.json');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(file)) return {};
    const content = readFileSync(file, 'utf-8').trim();
    if (!content) return {};
    return JSON.parse(content);
  }

  private save(data: Record<string, Record<string, number>>) {
    writeFileSync(getDataFile('ip-quota.json'), JSON.stringify(data, null, 2));
  }
}
