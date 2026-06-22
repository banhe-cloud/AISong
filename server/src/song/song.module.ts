import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LyricsService } from '../lyrics/lyrics.service';
import { MinimaxService } from '../minimax/minimax.service';
import { QuotaModule } from '../quota/quota.module';
import { TaskStoreService } from '../task/task-store.service';
import { SongController } from './song.controller';
import { SongHistoryService } from './song-history.service';
import { SongService } from './song.service';

@Module({
  imports: [QuotaModule, AuthModule],
  controllers: [SongController],
  providers: [SongService, SongHistoryService, MinimaxService, TaskStoreService, LyricsService],
})
export class SongModule {}
