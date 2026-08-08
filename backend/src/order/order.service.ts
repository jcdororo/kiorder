import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, MAX_QUANTITY_PER_MENU } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
    });
    if (!table) throw new NotFoundException('테이블이 없습니다.');

    // 같은 메뉴를 여러 줄로 쪼개 보내면 항목별 @Max(99)를 우회할 수 있다.
    // 검증 전에 menuItemId 기준으로 병합해 "한 주문에 한 메뉴 한 줄"로 정규화한다.
    const mergedItems = new Map<string, number>();
    for (const item of dto.items) {
      mergedItems.set(
        item.menuItemId,
        (mergedItems.get(item.menuItemId) ?? 0) + item.quantity,
      );
    }

    const menuItemIds = [...mergedItems.keys()];
    const menuItems = await this.prisma.menuItem.findMany({
      // 삭제된 메뉴는 목록에 없지만, 삭제 전에 화면을 열어둔 단말이 그대로 담아 보낼 수 있다.
      where: { id: { in: menuItemIds }, deletedAt: null },
      select: {
        id: true,
        type: true,
        name: true,
        price: true,
        available: true,
        storeId: true,
      },
    });
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // 주문 가능 여부는 DB 값이 유일한 기준이다. 클라이언트가 보낸 name/price는 신뢰하지 않는다.
    // 쓰기 전에 전부 모아서 검증해야 부분 주문이 생기지 않는다.
    const soldOutNames: string[] = [];
    const overLimitNames: string[] = [];
    let hasUnorderable = false;
    const orderItems: {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      needsKitchen: boolean;
    }[] = [];

    for (const [menuItemId, quantity] of mergedItems) {
      const menuItem = menuMap.get(menuItemId);
      // 없는 메뉴와 타 매장 메뉴는 손님에게 같은 계열로 보인다(타 매장 존재를 노출하지 않는다).
      if (!menuItem || menuItem.storeId !== table.storeId) {
        hasUnorderable = true;
        continue;
      }
      if (!menuItem.available) {
        soldOutNames.push(menuItem.name);
        continue;
      }
      // 병합 후 합계로 판정한다. DTO의 @Max(99)는 항목 하나만 보므로 여기서 다시 막는다.
      if (quantity > MAX_QUANTITY_PER_MENU) {
        overLimitNames.push(`${menuItem.name} ${quantity}개`);
        continue;
      }
      orderItems.push({
        menuItemId: menuItem.id,
        // 스냅샷은 DB 값으로 남긴다 — 클라이언트 값을 그대로 저장하면 가격 조작이 가능하다.
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        needsKitchen: menuItem.type === 'FOOD',
      });
    }

    if (hasUnorderable) {
      throw new BadRequestException(
        '주문할 수 없는 메뉴가 포함되어 있습니다. 메뉴를 다시 확인해 주세요.',
      );
    }
    // 손님이 여러 번 시도하지 않도록 문제 메뉴를 한 번에 모아서 알린다.
    if (soldOutNames.length > 0) {
      throw new BadRequestException(
        `품절된 메뉴가 있습니다: ${soldOutNames.join(', ')}`,
      );
    }
    if (overLimitNames.length > 0) {
      throw new BadRequestException(
        `수량이 너무 많은 메뉴가 있습니다: ${overLimitNames.join(', ')} (한 메뉴당 최대 ${MAX_QUANTITY_PER_MENU}개)`,
      );
    }

    return this.prisma.order.create({
      data: {
        storeId: table.storeId,
        tableId: dto.tableId,
        requests: dto.requests,
        orderItems: { create: orderItems },
      },
      include: { orderItems: true, table: true },
    });
  }

  async getOrders(userId: string, tableId?: string) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');

    return this.prisma.order.findMany({
      where: {
        storeId: store.id,
        ...(tableId ? { tableId, NOT: { status: '결제완료' } } : {}),
      },
      include: {
        orderItems: { include: { menuItem: { select: { type: true } } } },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateHallReceived(id: string, hallReceived: boolean) {
    return this.prisma.order.update({
      where: { id },
      data: { hallReceived },
      include: {
        orderItems: { include: { menuItem: { select: { type: true } } } },
        table: true,
      },
    });
  }

  async updateOrderStatus(id: string, status: string) {
    const data: Record<string, unknown> = { status };
    if (status === '조리중') data.startedAt = new Date();
    if (status === '완료' || status === '결제완료')
      data.completedAt = new Date();
    return this.prisma.order.update({
      where: { id },
      data,
      include: { orderItems: true, table: true },
    });
  }
}
