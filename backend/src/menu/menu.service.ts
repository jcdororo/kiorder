import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMenus(userId: string) {
    const storeId = await this.getStoreId(userId);
    // 정렬을 명시하지 않으면 Postgres가 순서를 보장하지 않아, 메뉴를 토글할 때마다
    // 목록과 카테고리 탭 순서가 뒤바뀐다 (테이블오더·홀 주문 화면도 같은 API를 쓴다)
    return this.prisma.menuItem.findMany({
      where: { storeId, deletedAt: null },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async createMenu(userId: string, data: CreateMenuDto) {
    const storeId = await this.getStoreId(userId);
    return this.prisma.menuItem.create({
      data: { ...data, storeId, available: true },
    });
  }

  // update/delete는 id만 받으면 남의 매장 메뉴 id로도 통과한다.
  // 로그인 사용자의 매장으로 범위를 좁혀 두 경우 모두 "없는 메뉴"로 떨어뜨린다.
  private async getStoreId(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');
    return store.id;
  }

  async updateMenu(userId: string, id: string, data: UpdateMenuDto) {
    const storeId = await this.getStoreId(userId);
    const { count } = await this.prisma.menuItem.updateMany({
      where: { id, storeId, deletedAt: null },
      data,
    });
    if (count === 0) throw new NotFoundException('메뉴가 없습니다.');
    return this.prisma.menuItem.findUnique({ where: { id } });
  }

  /**
   * 주문 이력(OrderItem)이 메뉴를 FK로 참조하므로 물리 삭제하면 제약 위반으로 실패한다.
   * 매출·주문 내역을 지울 수는 없으니 deletedAt만 찍어 목록에서 감춘다(소프트 삭제).
   */
  async deleteMenu(userId: string, id: string) {
    const storeId = await this.getStoreId(userId);
    const { count } = await this.prisma.menuItem.updateMany({
      where: { id, storeId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('메뉴가 없습니다.');
    return { id };
  }
}
