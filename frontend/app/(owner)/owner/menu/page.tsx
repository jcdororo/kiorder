"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ClipboardList,
  UtensilsCrossed,
  Settings,
  Plus,
  Pencil,
  Trash2,
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
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/menu`, {
      credentials: "include",
    })
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/menu/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ available: !item.available }),
      },
    );
    if (!res.ok) return toast.error("상태 변경에 실패했습니다.");
    setMenuItems(
      menuItems.map((i) =>
        i.id === id ? { ...i, available: !i.available } : i,
      ),
    );
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/menu/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
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
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/menu${editingItem ? `/${editingItem.id}` : ""}`;
    const method = editingItem ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) { toast.error("저장에 실패했습니다."); return; }

    const saved = await res.json();
    if (editingItem) {
      setMenuItems(menuItems.map((item) => (item.id === editingItem.id ? saved : item)));
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-[#E5E7EB] p-4">
        <div className="mb-8">
          <h1 className="text-xl text-[#111827] mb-1">맛있는 식당</h1>
          <p className="text-sm text-[#6B7280]">관리자</p>
        </div>

        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/admin/waiting")}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            웨이팅 관리
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20"
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            메뉴 관리
          </Button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#6B7280]"
            >
              <Settings className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-[#111827]">메뉴 관리</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
                onClick={openAddDialog}
              >
                <Plus className="w-4 h-4 mr-2" />
                메뉴 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "메뉴 수정" : "메뉴 추가"}
                </DialogTitle>
                <DialogDescription>메뉴 정보를 입력해주세요</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>메뉴명</FormLabel>
                      <FormControl><Input placeholder="메뉴 이름" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="메인">메인</SelectItem>
                          <SelectItem value="사이드">사이드</SelectItem>
                          <SelectItem value="음료">음료</SelectItem>
                          <SelectItem value="주류">주류</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>가격</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl><Textarea placeholder="메뉴 설명" rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                    <Button type="submit" className="bg-[#F97316] hover:bg-[#F97316]/90 text-white">
                      {editingItem ? "수정" : "저장"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-[#F97316] hover:bg-[#F97316]/90"
                  : "border-[#E5E7EB]"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Table */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이미지</TableHead>
                  <TableHead>메뉴명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="text-[#111827]">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#E5E7EB]">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#6B7280]">
                      {item.price.toLocaleString()}원
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleAvailability(item.id)}
                        />
                        <span className="text-sm text-[#6B7280]">
                          {item.available ? "판매중" : "품절"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4 text-[#6B7280]" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
