import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  getMenus(@Request() req: { user: { userId: string } }) {
    return this.menuService.getMenus(req.user.userId);
  }

  @Post()
  createMenu(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateMenuDto,
  ) {
    return this.menuService.createMenu(req.user.userId, dto);
  }

  @Patch(':id')
  updateMenu(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, dto);
  }

  @Delete(':id')
  deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }
}
