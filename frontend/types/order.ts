export type OrderStatus = "접수됨" | "조리중" | "완료";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface KitchenOrder {
  id: string;
  tableNumber: number;
  orderNumber: string;
  status: OrderStatus;
  items: { name: string; quantity: number; needsKitchen: boolean }[];
  hallReceived: boolean;
  receivedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface HallOrder {
  id: string;
  tableNumber: number;
  orderNumber: string;
  status: OrderStatus;
  items: { name: string; quantity: number; type: string }[];
  hallReceived: boolean;
  receivedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type BackendOrder = {
  id: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  hallReceived: boolean;
  table: { number: number };
  orderItems: {
    name: string;
    quantity: number;
    needsKitchen: boolean;
    menuItem: { type: string };
  }[];
};

// POS 결제 화면용 (usePosOrders에서 이관)
export type Table = { id: string; number: number };
export type PosOrderItem = { name: string; price: number; quantity: number };
export type PosOrder = {
  id: string;
  tableId: string;
  status: string;
  createdAt: string;
  orderItems: PosOrderItem[];
};
