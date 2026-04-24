import { PrismaService } from '../prisma/prisma.service';
export declare class TableService {
    private prisma;
    constructor(prisma: PrismaService);
    getTables(userId: string): Promise<{
        number: number;
        id: string;
        storeId: string;
    }[]>;
}
