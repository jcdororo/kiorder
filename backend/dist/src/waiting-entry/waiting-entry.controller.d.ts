import { WaitingEntryService } from './waiting-entry.service';
import { CreateWaitingDto } from './dto/create-waiting.dto';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto';
export declare class WaitingEntryController {
    private readonly waitingEntryService;
    constructor(waitingEntryService: WaitingEntryService);
    create(req: {
        user: {
            userId: string;
        };
    }, dto: CreateWaitingDto): Promise<{
        number: number;
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        phone: string;
        partySize: number;
    }>;
    findAll(req: {
        user: {
            userId: string;
        };
    }): Promise<{
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
