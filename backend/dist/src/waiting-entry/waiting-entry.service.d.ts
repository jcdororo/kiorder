import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingDto } from './dto/create-waiting.dto';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto';
export declare class WaitingEntryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateWaitingDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
    }>;
    findAll(userId: string): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
    }[]>;
    findOne(id: string): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
    } | null>;
    updateStatus(id: string, dto: UpdateWaitingStatusDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
    }>;
}
