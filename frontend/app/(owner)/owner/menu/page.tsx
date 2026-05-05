"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  PhoneCall,
  Home,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useRouter } from "next/navigation";
import { AdminMenuItem } from "@/types/types";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const menuSchema = z.object({
  name: z.string().min(1, "메뉴명을 입력해주세요."),
  category: z.string().min(1, "카테고리를 선택해주세요."),
  price: z.coerce.number().min(1, "가격을 입력해주세요."),
  description: z.string().optional(),
  image: z.string().optional(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export default function Page() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema) as Resolver<MenuFormValues>,
    defaultValues: {
      name: "",
      category: "메인",
      price: 0,
      description: "",
      image: "",
    },
  });

  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);

  const categories = ["전체", "메인", "사이드", "음료", "주류"];

  useEffect(() => {
    apiFetch("/menu")
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch(() => toast.error("메뉴를 불러오지 못했습니다."));
  }, []);

  const filteredItems =
    selectedCategory === "전체"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const toggleAvailability = async (id: string) => {
    const item = menuItems.find((i) => i.id === id)!;
    const res = await apiFetch(`/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    if (!res.ok) return toast.error("상태 변경에 실패했습니다.");
    setMenuItems(
      menuItems.map((i) =>
        i.id === id ? { ...i, available: !i.available } : i,
      ),
    );
  };

  const handleDelete = async (id: string) => {
    const res = await apiFetch(`/menu/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("삭제에 실패했습니다.");
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const handleEdit = (item: AdminMenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description ?? "",
      image: item.image ?? "",
    });
    setIsAddDialogOpen(true);
  };

  const onSubmit = async (data: MenuFormValues): Promise<void> => {
    const path = `/menu${editingItem ? `/${editingItem.id}` : ""}`;
    const method = editingItem ? "PATCH" : "POST";

    const res = await apiFetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("저장에 실패했습니다.");
      return;
    }

    const saved = await res.json();
    if (editingItem) {
      setMenuItems(
        menuItems.map((item) => (item.id === editingItem.id ? saved : item)),
      );
    } else {
      setMenuItems([...menuItems, saved]);
    }
    setIsAddDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const openAddDialog = () => {
    setEditingItem(null);
    form.reset({ name: "", category: "메인", price: 0, description: "", image: "" });
    setIsAddDialogOpen(true);
  };

  const menuDialog = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={openAddDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          메뉴 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingItem ? "메뉴 수정" : "메뉴 추가"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            메뉴 정보를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">메뉴명</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="메뉴 이름"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">카테고리</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="메인">메인</SelectItem>
                      <SelectItem value="사이드">사이드</SelectItem>
                      <SelectItem value="음료">음료</SelectItem>
                      <SelectItem value="주류">주류</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">가격</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="메뉴 설명"
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => setIsAddDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {editingItem ? "수정" : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold">맛있는 식당</h1>
          <p className="text-xs text-gray-500">메뉴 관리</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => router.push("/owner/waiting")}
          >
            웨이팅
          </Button>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-white hover:bg-white/10"
            >
              홈
            </Button>
          </Link>
        </div>
      </div>

      {/* Sidebar — 태블릿: 아이콘만(w-14), PC: 전체(w-60) */}
      <div className="hidden md:flex md:w-14 lg:w-60 shrink-0 bg-gray-900 border-r border-white/10 md:p-2 lg:p-4 flex-col">
        <div className="mb-8 hidden lg:block">
          <h1 className="text-xl text-white mb-1">맛있는 식당</h1>
          <p className="text-sm text-gray-500">관리자</p>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-center lg:justify-start text-gray-400 hover:text-white hover:bg-white/10 px-2 lg:px-4"
            onClick={() => router.push("/owner/waiting")}
          >
            <PhoneCall className="w-4 h-4 shrink-0 lg:mr-2" />
            <span className="hidden lg:inline">웨이팅 관리</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-center lg:justify-start bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-2 lg:px-4"
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0 lg:mr-2" />
            <span className="hidden lg:inline">메뉴 관리</span>
          </Button>
        </nav>

        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-center lg:justify-start text-gray-500 hover:text-white hover:bg-white/10 px-2 lg:px-4"
          >
            <Home className="w-4 h-4 shrink-0 lg:mr-2" />
            <span className="hidden lg:inline">홈으로</span>
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl text-white">메뉴 관리</h1>
          {menuDialog}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-orange-500 hover:bg-orange-600 text-white border-none"
                  : "border-white/20 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/40"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Mobile: 카드 리스트 */}
        <div className="md:hidden space-y-3">
          {filteredItems.length === 0 && (
            <p className="text-center text-gray-600 py-12">메뉴가 없어요</p>
          )}
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-xl border border-white/10 p-4 flex items-center gap-3"
            >
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium truncate">
                    {item.name}
                  </span>
                  <Badge className="bg-white/10 text-gray-300 border-white/20 shrink-0">
                    {item.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">
                    {item.price.toLocaleString()}원
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id)}
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
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet/PC: 테이블 */}
        <div className="hidden md:block bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-500 hidden lg:table-cell">
                  이미지
                </TableHead>
                <TableHead className="text-gray-500">메뉴명</TableHead>
                <TableHead className="text-gray-500">카테고리</TableHead>
                <TableHead className="text-gray-500">가격</TableHead>
                <TableHead className="text-gray-500">상태</TableHead>
                <TableHead className="text-gray-500 text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-white/5 hover:bg-white/5"
                >
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
                  <TableCell className="text-gray-400">
                    {item.price.toLocaleString()}원
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => toggleAvailability(item.id)}
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
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(item.id)}
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
      </div>
    </div>
  );
}
