import { Body, Controller, Get, Header, Post, Query, Req, StreamableFile } from '@nestjs/common';
import { Request } from 'express';
import { QuotaService } from '../quota/quota.service';
import { SongService } from './song.service';

@Controller()
export class SongController {
  constructor(
    private readonly songService: SongService,
    private readonly quotaService: QuotaService,
  ) {}

  @Get()
  hello() {
    return { message: 'AI Song Maker API' };
  }

  @Get('quota')
  quota(@Req() req: Request) {
    return this.quotaService.getQuota(this.getClientIp(req));
  }

  @Get('songs')
  songs(@Req() req: Request, @Query('page') page = '1', @Query('limit') limit = '5') {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 5));
    return this.songService.listHistory(this.getClientIp(req), p, l);
  }

  @Post('generate')
  generate(@Body() body: { prompt: string }, @Req() req: Request) {
    const ip = this.getClientIp(req);
    this.quotaService.checkAndConsume(ip);
    return this.songService.generate(body, ip);
  }

  @Get('download')
  @Header('Cache-Control', 'no-store')
  async download(@Query('url') url: string, @Query('name') name: string) {
    if (!url?.startsWith('http')) {
      throw new Error('invalid url');
    }
    let hostname = '';
    try {
      hostname = new URL(url).hostname;
    } catch {
      throw new Error('invalid url');
    }
    if (!hostname.endsWith('theapi.app')) {
      throw new Error('invalid url');
    }
    const upstream = await fetch(url);
    if (!upstream.ok) {
      throw new Error('fetch failed');
    }
    const filename = (name || 'music.mp3').replace(/[^\w.\- ()#]/g, '_');
    const buf = Buffer.from(await upstream.arrayBuffer());
    const type = upstream.headers.get('content-type') || 'application/octet-stream';
    return new StreamableFile(buf, {
      type,
      disposition: `attachment; filename="${filename}"`,
    });
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
