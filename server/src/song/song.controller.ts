import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { QuotaService } from '../quota/quota.service';
import { SongService } from './song.service';

@Controller()
export class SongController {
  constructor(
    private readonly songService: SongService,
    private readonly quotaService: QuotaService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  hello() {
    return { message: 'AI Song Maker API' };
  }

  @Get('quota')
  async quota(@Req() req: Request) {
    return this.quotaService.getQuota(await this.auth.getUserKey(req));
  }

  @Get('songs')
  async songs(@Req() req: Request, @Query('page') page = '1', @Query('limit') limit = '5') {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 5));
    return this.songService.listHistory(await this.auth.getUserKey(req), p, l);
  }

  @Post('lyrics')
  lyrics(@Body() body: { prompt: string }) {
    return this.songService.generateLyrics(body.prompt);
  }

  @Post('generate')
  async generate(
    @Body() body: { prompt: string; lyrics?: string; vocalType?: string; version?: string },
    @Req() req: Request,
  ) {
    const userKey = await this.auth.getUserKey(req);
    this.quotaService.checkAndConsume(userKey);
    console.log('[generate]', {
      userKey,
      version: body.version || 'v2',
      prompt: body.prompt,
      vocalType: body.vocalType,
      hasLyrics: !!body.lyrics?.trim(),
    });
    return this.songService.generate(body, userKey);
  }

  @Get('task/:taskId')
  taskStatus(@Param('taskId') taskId: string) {
    return this.songService.getTaskStatus(taskId);
  }
}
