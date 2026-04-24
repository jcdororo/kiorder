import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingDto } from './dto/create-waiting.dto';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto';

@Injectable()
export class WaitingEntryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateWaitingDto) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');
    const count = await this.prisma.waitingEntry.count({
      where: { storeId: store.id },
    });
    return this.prisma.waitingEntry.create({
      data: {
        storeId: store.id,
        phone: dto.phone,
        partySize: dto.partySize,
        number: count + 1,
      },
    });
  }

  async findAll(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { userId } });
    if (!store) throw new NotFoundException('매장이 없습니다.');
    return this.prisma.waitingEntry.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.waitingEntry.findUnique({ where: { id } });
  }

  async updateStatus(id: string, dto: UpdateWaitingStatusDto) {
    return this.prisma.waitingEntry.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
