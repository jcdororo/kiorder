import { Module } from '@nestjs/common';
import { WaitingEntryController } from './waiting-entry.controller';
import { WaitingEntryService } from './waiting-entry.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaitingEntryController],
  providers: [WaitingEntryService],
})
export class WaitingEntryModule {}
