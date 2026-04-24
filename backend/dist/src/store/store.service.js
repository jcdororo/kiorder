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
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StoreService = class StoreService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyStore(userId) {
        return this.prisma.store.findUnique({ where: { userId } });
    }
    async getAllStores() {
        return this.prisma.store.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createStore(userId, name) {
        const existing = await this.prisma.store.findUnique({ where: { userId } });
        if (existing)
            throw new common_1.ConflictException('이미 매장이 존재합니다.');
        return this.prisma.store.create({ data: { userId, name } });
    }
};
exports.StoreService = StoreService;
exports.StoreService = StoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoreService);
//# sourceMappingURL=store.service.js.map