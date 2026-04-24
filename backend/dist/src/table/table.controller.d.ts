import { TableService } from './table.service';
export declare class TableController {
    private tableService;
    constructor(tableService: TableService);
    getTables(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        number: number;
        id: string;
        storeId: string;
    }[]>;
}
