import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    const table = await this.prisma.table.findUnique({
      where: { id: dto.tableId },
    });
    if (!table) throw new NotFoundException('테이블이 없습니다.');

    const menuItemIds = dto.items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, type: true },
    });
    const typeMap = new Map(menuItems.map((m) => [m.id, m.type]));

    return this.prisma.order.create({
      data: {
        storeId: table.storeId,
        tableId: dto.tableId,
        requests: dto.requests,
        orderItems: {
          create: dto.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            needsKitchen: typeMap.get(item.menuItemId) === 'FOOD',
          })),
        },
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
    if (status === '완료' || status === '결제완료') data.completedAt = new Date();
    return this.prisma.order.update({
      where: { id },
      data,
      include: { orderItems: true, table: true },
    });
  }
}
