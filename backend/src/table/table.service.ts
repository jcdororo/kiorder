import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  async getTables(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');
    return this.prisma.table.findMany({
      where: { storeId: store.id },
      orderBy: { number: 'asc' },
    });
  }
}
