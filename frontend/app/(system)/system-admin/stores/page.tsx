"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Stores } from "@/types/types";

const mockStores: Stores[] = [
  {
    id: "1",
    name: "맛있는 한식당",
    ownerName: "김사장",
    phone: "010-1234-5678",
    email: "kim@restaurant.com",
    address: "서울시 강남구 테헤란로 123",
    businessNumber: "123-45-67890",
    status: "ACTIVE",
    subscriptionPlan: "PREMIUM",
    createdAt: new Date("2025-01-15"),
    lastLoginAt: new Date("2026-04-15T09:30:00"),
  },
  {
    id: "2",
    name: "바른 분식",
    ownerName: "이사장",
    phone: "010-2345-6789",
    email: "lee@bunsik.com",
    address: "서울시 송파구 올림픽로 456",
    businessNumber: "234-56-78901",
    status: "ACTIVE",
    subscriptionPlan: "STANDARD",
    createdAt: new Date("2025-03-20"),
    lastLoginAt: new Date("2026-04-14T18:45:00"),
  },
  {
    id: "3",
    name: "우리 카페",
    ownerName: "박사장",
    phone: "010-3456-7890",
    email: "park@cafe.com",
    address: "서울시 마포구 월드컵로 789",
    businessNumber: "345-67-89012",
    status: "INACTIVE",
    subscriptionPlan: "BASIC",
    createdAt: new Date("2024-11-10"),
    lastLoginAt: new Date("2026-03-28T14:20:00"),
  },
  {
    id: "4",
    name: "행복 치킨",
    ownerName: "최사장",
    phone: "010-4567-8901",
    email: "choi@chicken.com",
    address: "경기도 성남시 분당구 판교로 101",
    businessNumber: "456-78-90123",
    status: "PENDING",
    subscriptionPlan: "STANDARD",
    createdAt: new Date("2026-04-10"),
    lastLoginAt: new Date("2026-04-10T10:15:00"),
  },
  {
    id: "5",
    name: "정성 일식당",
    ownerName: "정사장",
    phone: "010-5678-9012",
    email: "jung@sushi.com",
    address: "서울시 서초구 강남대로 202",
    businessNumber: "567-89-01234",
    status: "ACTIVE",
    subscriptionPlan: "PREMIUM",
    createdAt: new Date("2025-06-05"),
    lastLoginAt: new Date("2026-04-15T07:00:00"),
  },
];

export default function Page() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  const [stores, setStores] = useState<Stores[]>(mockStores);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Stores | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    businessNumber: "",
    subscriptionPlan: "BASIC" as Stores["subscriptionPlan"],
  });

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.phone.includes(searchQuery) ||
      store.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" || store.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (store?: Stores) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        ownerName: store.ownerName,
        phone: store.phone,
        email: store.email,
        address: store.address,
        businessNumber: store.businessNumber,
        subscriptionPlan: store.subscriptionPlan,
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: "",
        ownerName: "",
        phone: "",
        email: "",
        address: "",
        businessNumber: "",
        subscriptionPlan: "BASIC",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveStore = () => {
    if (editingStore) {
      // 수정
      setStores(
        stores.map((s) =>
          s.id === editingStore.id ? { ...s, ...formData } : s,
        ),
      );
      toast.success(`${formData.name} 매장이 수정되었습니다.`);
    } else {
      // 추가
      const newStore: Stores = {
        id: String(stores.length + 1),
        ...formData,
        status: "PENDING",
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      setStores([...stores, newStore]);
      toast.success(`${formData.name} 매장이 추가되었습니다.`);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (store && window.confirm(`${store.name} 매장을 삭제하시겠습니까?`)) {
      setStores(stores.filter((s) => s.id !== storeId));
      toast.success(`${store.name} 매장이 삭제되었습니다.`);
    }
  };

  const handleStatusChange = (storeId: string, newStatus: Stores["status"]) => {
    setStores(
      stores.map((s) => (s.id === storeId ? { ...s, status: newStatus } : s)),
    );
    const store = stores.find((s) => s.id === storeId);
    toast.success(`${store?.name} 매장 상태가 변경되었습니다.`);
  };

  const getStatusBadge = (status: Stores["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            운영중
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            비활성
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            승인대기
          </Badge>
        );
    }
  };

  const getPlanBadge = (plan: Stores["subscriptionPlan"]) => {
    switch (plan) {
      case "PREMIUM":
        return (
          <Badge className="bg-purple-500">
            <Crown className="w-3 h-3 mr-1" />
            프리미엄
          </Badge>
        );
      case "STANDARD":
        return <Badge className="bg-blue-500">스탠다드</Badge>;
      case "BASIC":
        return <Badge variant="outline">베이직</Badge>;
    }
  };

  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.status === "ACTIVE").length,
    inactive: stores.filter((s) => s.status === "INACTIVE").length,
    pending: stores.filter((s) => s.status === "PENDING").length,
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-xl">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="m-0">매장 관리</h1>
                <p className="text-muted-foreground">
                  전체 매장 및 사장님 관리
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                로그아웃
              </Button>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                매장 추가
              </Button>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <div className="text-muted-foreground text-sm mb-1">
                전체 매장
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <div className="text-muted-foreground text-sm mb-1">운영중</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
              <div className="text-muted-foreground text-sm mb-1">승인대기</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-500">
              <div className="text-muted-foreground text-sm mb-1">비활성</div>
              <div className="text-2xl font-bold text-gray-600">
                {stats.inactive}
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="매장명, 사장님명, 전화번호, 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 상태</SelectItem>
                <SelectItem value="ACTIVE">운영중</SelectItem>
                <SelectItem value="INACTIVE">비활성</SelectItem>
                <SelectItem value="PENDING">승인대기</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 매장 목록 */}
        <div className="grid gap-4">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="m-0">{store.name}</h3>
                        {getStatusBadge(store.status)}
                        {getPlanBadge(store.subscriptionPlan)}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{store.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{store.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{store.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{store.address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          가입: {store.createdAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          최근 로그인: {store.lastLoginAt.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2">
                  {store.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(store.id, "ACTIVE")}
                      className="gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      승인
                    </Button>
                  )}
                  {store.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(store.id, "INACTIVE")}
                      className="gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      비활성화
                    </Button>
                  )}
                  {store.status === "INACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(store.id, "ACTIVE")}
                      className="gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      활성화
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(store)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteStore(store.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredStores.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 매장 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? "매장 정보 수정" : "새 매장 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingStore
                ? "매장 정보를 수정합니다."
                : "새로운 매장을 추가합니다."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">매장명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="맛있는 한식당"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">사장님명 *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  placeholder="김사장"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="010-1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="store@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소 *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="서울시 강남구 테헤란로 123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자번호 *</Label>
                <Input
                  id="businessNumber"
                  value={formData.businessNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, businessNumber: e.target.value })
                  }
                  placeholder="123-45-67890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscriptionPlan">구독 플랜 *</Label>
                <Select
                  value={formData.subscriptionPlan}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      subscriptionPlan: value as Stores["subscriptionPlan"],
                    })
                  }
                >
                  <SelectTrigger id="subscriptionPlan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">베이직</SelectItem>
                    <SelectItem value="STANDARD">스탠다드</SelectItem>
                    <SelectItem value="PREMIUM">프리미엄</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveStore}>
              {editingStore ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
