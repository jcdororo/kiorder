import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

// 받침 유무에 따라 "을/를" 조사를 고른다 (예: "등심" → "을", "커피" → "를")
function objectParticle(word: string) {
  const lastChar = word.charCodeAt(word.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return "를";
  const hasBatchim = (lastChar - 0xac00) % 28 !== 0;
  return hasBatchim ? "을" : "를";
}

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
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-700"
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          {`'${item.name}'${objectParticle(item.name)} 삭제할까요?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          삭제하면 메뉴 목록에서 즉시 사라지며 복구할 수
                          없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white">
                          취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(item.id)}
                          className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
