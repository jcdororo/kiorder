import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WaitingEntryService } from './waiting-entry.service';
import { CreateWaitingDto } from './dto/create-waiting.dto';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto';

@Controller('waiting')
export class WaitingEntryController {
  constructor(private readonly waitingEntryService: WaitingEntryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateWaitingDto,
  ) {
    return this.waitingEntryService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.waitingEntryService.findAll(req.user.userId);
  }

  @Get('status/:id')
  findOne(@Param('id') id: string) {
    return this.waitingEntryService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateWaitingStatusDto) {
    return this.waitingEntryService.updateStatus(id, dto);
  }
}
