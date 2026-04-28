import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingDto } from './dto/create-waiting.dto';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto';
import { UpdateGuestResponseDto } from './dto/update-guest-response.dto';
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
        guestResponse: string | null;
    }>;
    findAll(userId: string): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
        guestResponse: string | null;
    }[]>;
    findOne(id: string): Promise<{
        ahead: number;
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
        guestResponse: string | null;
    } | null>;
    updateStatus(id: string, dto: UpdateWaitingStatusDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
        guestResponse: string | null;
    }>;
    updateGuestResponse(id: string, dto: UpdateGuestResponseDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
        guestResponse: string | null;
    }>;
}
