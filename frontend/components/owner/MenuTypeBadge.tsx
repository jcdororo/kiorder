import { Badge } from "@/components/ui/badge";
import { MenuItemType } from "@/types/menu";

const TYPE_LABEL: Record<MenuItemType, string> = {
  FOOD: "주방",
  DRINK: "음료",
  SERVICE: "직원호출",
};

const TYPE_COLOR: Record<MenuItemType, string> = {
  FOOD: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  DRINK: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  SERVICE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export function MenuTypeBadge({
  type,
  className = "",
}: {
  type: MenuItemType;
  className?: string;
}) {
  const t = type ?? "FOOD";
  return (
    <Badge className={`${TYPE_COLOR[t]} ${className}`}>{TYPE_LABEL[t]}</Badge>
  );
}
