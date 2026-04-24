import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
export declare class StoreController {
    private storeService;
    constructor(storeService: StoreService);
    getMyStore(req: {
        user: {
            userId: string;
        };
    }): Promise<{
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
    createStore(req: {
        user: {
            userId: string;
        };
    }, dto: CreateStoreDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
    }>;
}
