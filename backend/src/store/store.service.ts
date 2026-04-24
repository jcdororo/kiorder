import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async getMyStore(userId: string) {
    return this.prisma.store.findUnique({ where: { userId } });
  }

  async getAllStores() {
    return this.prisma.store.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStore(userId: string, name: string) {
    const existing = await this.prisma.store.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('이미 매장이 존재합니다.');
    return this.prisma.store.create({ data: { userId, name } });
  }
}
