import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenuController {
    private menuService;
    constructor(menuService: MenuService);
    getMenus(req: {
        user: {
            userId: string;
        };
    }): Promise<{
        id: string;
        name: string;
        category: string;
        price: number;
        description: string | null;
        image: string | null;
        available: boolean;
        storeId: string;
    }[]>;
    createMenu(req: {
        user: {
            userId: string;
        };
    }, dto: CreateMenuDto): Promise<{
        id: string;
        name: string;
        category: string;
        price: number;
        description: string | null;
        image: string | null;
        available: boolean;
        storeId: string;
    }>;
    updateMenu(id: string, dto: UpdateMenuDto): Promise<{
        id: string;
        name: string;
        category: string;
        price: number;
        description: string | null;
        image: string | null;
        available: boolean;
        storeId: string;
    }>;
    deleteMenu(id: string): Promise<{
        id: string;
        name: string;
        category: string;
        price: number;
        description: string | null;
        image: string | null;
        available: boolean;
        storeId: string;
    }>;
}
