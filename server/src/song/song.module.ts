import { Module } from '@nestjs/common';
import { LyricsService } from '../lyrics/lyrics.service';
import { PiapiService } from '../piapi/piapi.service';
import { QuotaModule } from '../quota/quota.module';
import { SongController } from './song.controller';
import { SongHistoryService } from './song-history.service';
import { SongService } from './song.service';

@Module({
  imports: [QuotaModule],
  controllers: [SongController],
  providers: [SongService, SongHistoryService, PiapiService, LyricsService],
})
export class SongModule {}
