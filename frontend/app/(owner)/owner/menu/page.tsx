"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdminMenuItem } from "@/types/menu";
import { useOwnerMenu } from "@/hooks/useOwnerMenu";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { MenuCard } from "@/components/owner/MenuCard";
import { MenuTable } from "@/components/owner/MenuTable";
import { MenuFormDialog } from "@/components/owner/MenuFormDialog";

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  const { menuItems, categories, toggleMutation, deleteMutation, saveMutation } =
    useOwnerMenu({
      onSaved: () => {
        setIsAddDialogOpen(false);
        setEditingItem(null);
      },
    });

  const filteredItems =
    selectedCategory === "전체"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleEdit = (item: AdminMenuItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleToggle = (item: AdminMenuItem) =>
    toggleMutation.mutate({ id: item.id, available: !item.available });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row">
      <OwnerSidebar active="menu" />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl text-white">메뉴 관리</h1>
          <MenuFormDialog
            key={`${isAddDialogOpen}-${editingItem?.id ?? "new"}`}
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            editingItem={editingItem}
            categories={categories}
            onSubmit={(payload) =>
              saveMutation.mutate({ data: payload, id: editingItem?.id })
            }
            isSaving={saveMutation.isPending}
            trigger={
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setEditingItem(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                메뉴 추가
              </Button>
            }
          />
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
            <MenuCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>

        {/* Tablet/PC: 테이블 */}
        <MenuTable
          items={filteredItems}
          onEdit={handleEdit}
          onToggle={handleToggle}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </div>
  );
}
