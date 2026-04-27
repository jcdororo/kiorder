"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingEntryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WaitingEntryService = class WaitingEntryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const store = await this.prisma.store.findUnique({ where: { userId } });
        if (!store)
            throw new common_1.NotFoundException('매장이 없습니다.');
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
    async findAll(userId) {
        const store = await this.prisma.store.findUnique({ where: { userId } });
        if (!store)
            throw new common_1.NotFoundException('매장이 없습니다.');
        return this.prisma.waitingEntry.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const entry = await this.prisma.waitingEntry.findUnique({ where: { id } });
        if (!entry)
            return null;
        const ahead = await this.prisma.waitingEntry.count({
            where: {
                storeId: entry.storeId,
                status: { in: ['대기중', '호출중'] },
                number: { lt: entry.number },
            },
        });
        return { ...entry, ahead };
    }
    async updateStatus(id, dto) {
        return this.prisma.waitingEntry.update({
            where: { id },
            data: { status: dto.status },
        });
    }
};
exports.WaitingEntryService = WaitingEntryService;
exports.WaitingEntryService = WaitingEntryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaitingEntryService);
//# sourceMappingURL=waiting-entry.service.js.map