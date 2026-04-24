import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrderService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(dto: CreateOrderDto): Promise<{
        table: {
            number: number;
            id: string;
            storeId: string;
        };
        orderItems: {
            id: string;
            name: string;
            price: number;
            menuItemId: string;
            quantity: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        storeId: string;
        tableId: string;
        requests: string | null;
        status: string;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    getOrders(userId: string): Promise<({
        table: {
            number: number;
            id: string;
            storeId: string;
        };
        orderItems: {
            id: string;
            name: string;
            price: number;
            menuItemId: string;
            quantity: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        storeId: string;
        tableId: string;
        requests: string | null;
        status: string;
        startedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    updateOrderStatus(id: string, status: string): Promise<{
        table: {
            number: number;
            id: string;
            storeId: string;
        };
        orderItems: {
            id: string;
            name: string;
            price: number;
            menuItemId: string;
            quantity: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        storeId: string;
        tableId: string;
        requests: string | null;
        status: string;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
}
