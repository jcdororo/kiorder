import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { AdminMenuItem } from "@/types/types";
import { MenuTypeBadge } from "./MenuTypeBadge";

export function MenuCard({
  item,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: AdminMenuItem;
  onEdit: (item: AdminMenuItem) => void;
  onToggle: (item: AdminMenuItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-white/10 p-4 flex items-center gap-3">
      <ImageWithFallback
        src={item.image}
        alt={item.name}
        className="w-12 h-12 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-white font-medium truncate">{item.name}</span>
          <Badge className="bg-white/10 text-gray-300 border-white/20 shrink-0">
            {item.category}
          </Badge>
          <MenuTypeBadge type={item.type} className="shrink-0" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {item.price.toLocaleString()}원
          </span>
          <div className="flex items-center gap-1.5">
            <Switch
              checked={item.available}
              onCheckedChange={() => onToggle(item)}
            />
            <span
              className={`text-xs ${item.available ? "text-green-400" : "text-gray-500"}`}
            >
              {item.available ? "판매중" : "품절"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-white/10"
          onClick={() => onEdit(item)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
