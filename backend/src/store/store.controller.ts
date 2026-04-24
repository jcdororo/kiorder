import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Get('my')
  getMyStore(@Request() req: { user: { userId: string } }) {
    return this.storeService.getMyStore(req.user.userId);
  }

  @Get()
  getAllStores() {
    return this.storeService.getAllStores();
  }

  @Post()
  createStore(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateStoreDto,
  ) {
    return this.storeService.createStore(req.user.userId, dto.name);
  }
}
