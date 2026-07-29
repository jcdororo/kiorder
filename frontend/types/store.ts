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
