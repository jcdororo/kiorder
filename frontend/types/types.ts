export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  available: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItem {
  menuId: string;
  menuName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: "PENDING" | "COOKING" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID";
  totalAmount: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface KitchenOrder {
  id: string;
  tableNumber: number;
  orderNumber: string;
  status: "접수됨" | "조리중" | "완료";
  items: { name: string; quantity: number }[];
  receivedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WaitingCustomer {
  id: string;
  number: number;
  phone: string;
  registeredAt: string;
  status: "대기중" | "호출중" | "입장완료" | "취소";
  guestResponse?: string | null;
}

export type MenuItemType = "FOOD" | "DRINK" | "SERVICE";

export interface AdminMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  available: boolean;
  type: MenuItemType;
}

export interface Stores {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  businessNumber: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  subscriptionPlan: "BASIC" | "STANDARD" | "PREMIUM";
  createdAt: Date;
  lastLoginAt: Date;
}

export interface WaitingItem {
  id: string;
  waitingNumber: number;
  phoneNumber: string;
  partySize: number;
  status: "WAITING" | "CALLED" | "SEATED" | "CANCELLED" | "NO_SHOW";
  createdAt: Date;
  calledAt?: Date;
  seatedAt?: Date;
}

export type BackendOrder = {
  id: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  table: { number: number };
  orderItems: { name: string; quantity: number }[];
};
