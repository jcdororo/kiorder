export interface WaitingCustomer {
  id: string;
  number: number;
  phone: string;
  registeredAt: string;
  status: "대기중" | "호출중" | "입장완료" | "취소";
  guestResponse?: string | null;
}
