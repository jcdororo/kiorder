import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TableService } from './table.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TableController {
  constructor(private tableService: TableService) {}

  @Get()
  getTables(@Request() req: { user: { userId: string } }) {
    return this.tableService.getTables(req.user.userId);
  }
}
