import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { AdminMenuItem } from "@/types/menu";
import { MenuTypeBadge } from "./MenuTypeBadge";

export function MenuTable({
  items,
  onEdit,
  onToggle,
  onDelete,
}: {
  items: AdminMenuItem[];
  onEdit: (item: AdminMenuItem) => void;
  onToggle: (item: AdminMenuItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="hidden md:block bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-gray-500 hidden lg:table-cell">
              이미지
            </TableHead>
            <TableHead className="text-gray-500">메뉴명</TableHead>
            <TableHead className="text-gray-500">카테고리</TableHead>
            <TableHead className="text-gray-500">타입</TableHead>
            <TableHead className="text-gray-500">가격</TableHead>
            <TableHead className="text-gray-500">상태</TableHead>
            <TableHead className="text-gray-500 text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
              <TableCell className="hidden lg:table-cell">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              </TableCell>
              <TableCell className="text-white">{item.name}</TableCell>
              <TableCell>
                <Badge className="bg-white/10 text-gray-300 border-white/20 hover:bg-white/20">
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell>
                <MenuTypeBadge type={item.type} />
              </TableCell>
              <TableCell className="text-gray-400">
                {item.price.toLocaleString()}원
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.available}
                    onCheckedChange={() => onToggle(item)}
                  />
                  <span
                    className={`text-sm ${item.available ? "text-green-400" : "text-gray-500"}`}
                  >
                    {item.available ? "판매중" : "품절"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
