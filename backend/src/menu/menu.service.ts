import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMenus(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');
    // 정렬을 명시하지 않으면 Postgres가 순서를 보장하지 않아, 메뉴를 토글할 때마다
    // 목록과 카테고리 탭 순서가 뒤바뀐다 (테이블오더·홀 주문 화면도 같은 API를 쓴다)
    return this.prisma.menuItem.findMany({
      where: { storeId: store.id },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async createMenu(userId: string, data: CreateMenuDto) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');
    return this.prisma.menuItem.create({
      data: { ...data, storeId: store.id, available: true },
    });
  }

  async updateMenu(id: string, data: UpdateMenuDto) {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  async deleteMenu(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
