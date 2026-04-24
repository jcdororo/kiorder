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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrderService = class OrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(dto) {
        const table = await this.prisma.table.findUnique({
            where: { id: dto.tableId },
        });
        if (!table)
            throw new common_1.NotFoundException('테이블이 없습니다.');
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
                    })),
                },
            },
            include: { orderItems: true, table: true },
        });
    }
    async getOrders(userId) {
        const store = await this.prisma.store.findUnique({ where: { userId } });
        if (!store)
            throw new common_1.NotFoundException('매장이 없습니다.');
        return this.prisma.order.findMany({
            where: { storeId: store.id },
            include: { orderItems: true, table: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateOrderStatus(id, status) {
        const data = { status };
        if (status === '조리중')
            data.startedAt = new Date();
        if (status === '완료')
            data.completedAt = new Date();
        return this.prisma.order.update({
            where: { id },
            data,
            include: { orderItems: true, table: true },
        });
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map