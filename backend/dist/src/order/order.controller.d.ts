import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrderController {
    private orderService;
    constructor(orderService: OrderService);
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
    getOrders(req: {
        user: {
            userId: string;
        };
    }): Promise<({
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
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
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
