import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getMenus(userId: string): Promise<{
        id: string;
        name: string;
        category: string;
        price: number;
        description: string | null;
        image: string | null;
        available: boolean;
        storeId: string;
    }[]>;
    createMenu(userId: string, data: CreateMenuDto): Promise<{
        id: string;
        name: string;
        category: string;
        price: number;
        description: string | null;
        image: string | null;
        available: boolean;
        storeId: string;
    }>;
    updateMenu(id: string, data: UpdateMenuDto): Promise<{
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
