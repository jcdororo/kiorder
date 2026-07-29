export type MenuItemType = "FOOD" | "DRINK" | "SERVICE";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  available: boolean;
  type?: string;
}

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
