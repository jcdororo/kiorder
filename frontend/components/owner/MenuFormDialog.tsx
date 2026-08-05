"use client";

import { useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdminMenuItem } from "@/types/menu";
import { MenuPayload } from "@/hooks/useOwnerMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  price: z.coerce.number().min(0, "가격을 입력해주세요."),
  type: z.enum(["FOOD", "DRINK", "SERVICE"]),
  description: z.string().optional(),
  image: z.string().optional(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

// category 기본값을 비워 둔다. 예전 기본값 "메인"은 실제 카테고리 목록에 없는 값이라,
// 사장님이 카테고리를 건드리지 않고 저장하면 어떤 필터 탭으로도 찾을 수 없는
// 미아 항목이 됐다. 빈 값이면 zod가 막아서 반드시 선택하게 된다.
const defaultFormValues: MenuFormValues = {
  name: "",
  category: "",
  price: 0,
  type: "FOOD",
  description: "",
  image: "",
};

const uploadImage = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("menu-images")
    .upload(path, file);
  if (error) throw new Error("이미지 업로드에 실패했습니다.");
  const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
  return data.publicUrl;
};

interface MenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: AdminMenuItem | null;
  categories: string[];
  onSubmit: (payload: MenuPayload) => void;
  isSaving: boolean;
  trigger: React.ReactNode;
}

export function MenuFormDialog({
  open,
  onOpenChange,
  editingItem,
  categories,
  onSubmit,
  isSaving,
  trigger,
}: MenuFormDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    editingItem?.image ?? "",
  );

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema) as Resolver<MenuFormValues>,
    defaultValues: editingItem
      ? {
          name: editingItem.name,
          category: editingItem.category,
          price: editingItem.price,
          type: editingItem.type ?? "FOOD",
          description: editingItem.description ?? "",
          image: editingItem.image ?? "",
        }
      : defaultFormValues,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (data: MenuFormValues) => {
    let imageUrl = data.image;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    onSubmit({ ...data, image: imageUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
            onSubmit={form.handleSubmit(handleSubmit)}
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
                  <FormControl>
                    <Input
                      placeholder="목록에서 고르거나 새로 입력"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      list="category-suggestions"
                      {...field}
                    />
                  </FormControl>
                  <datalist id="category-suggestions">
                    {categories
                      .filter((c) => c !== "전체")
                      .map((c) => (
                        <option key={c} value={c} />
                      ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">메뉴 타입</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="FOOD">주방 (요리)</SelectItem>
                      <SelectItem value="DRINK">음료 (홀 처리)</SelectItem>
                      <SelectItem value="SERVICE">
                        직원호출 (물티슈·수저 등)
                      </SelectItem>
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

            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">이미지</label>
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-dashed border-gray-600 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-700 cursor-pointer">
                      {imagePreview ? "이미지 변경" : "이미지 선택"}
                    </span>
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        form.setValue("image", "");
                      }}
                      className="text-xs text-red-400 hover:text-red-300 text-left"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
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
}
