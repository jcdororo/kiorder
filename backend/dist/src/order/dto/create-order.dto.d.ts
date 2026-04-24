export declare class OrderItemDto {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
}
export declare class CreateOrderDto {
    tableId: string;
    items: OrderItemDto[];
    requests?: string;
}
