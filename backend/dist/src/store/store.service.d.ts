import { PrismaService } from '../prisma/prisma.service';
export declare class StoreService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyStore(userId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
    } | null>;
    getAllStores(): Promise<({
        user: {
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
    })[]>;
    createStore(userId: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
    }>;
}
