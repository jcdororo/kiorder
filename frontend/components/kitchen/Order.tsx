"use client";

import { KitchenOrder } from "@/types/types";

type Props = {
  loadingId: string | null;
  order: KitchenOrder
};



export default function Page({ loadingId, order }: Props) {
  const isLoading = loadingId === order.id;
  const cookingTime = getCookingTime(order.startedAt);
  const isOverTime = cookingTime !== null && cookingTime > 15;


  
  return <div></div>;
}


  const getCookingTime = (startedAt?: string) => {
    if (!startedAt || !currentTime) return null;
    return Math.floor(
      (currentTime.getTime() - new Date(startedAt).getTime()) / 60000,
    );
  };
