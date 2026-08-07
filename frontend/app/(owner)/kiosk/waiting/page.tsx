"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Phone } from "lucide-react";
import { BackToTour } from "@/components/shared/BackToTour";
import { TabletFrame } from "@/components/kiosk/TabletFrame";
import { Screensaver } from "@/components/screensaver/Screensaver";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export default function Page() {
  const router = useRouter();
  const [partySize, setPartySize] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("/waiting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, partySize }),
      });
      if (!res.ok) throw new Error();
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: (data) => router.push(`/kiosk/complete?id=${data.id}`),
    onError: () => toast.error("웨이팅 등록에 실패했습니다."),
  });

  const handleNumberInput = (num: string) => {
    if (phoneNumber.length < 11) {
      setPhoneNumber(phoneNumber + num);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!partySize || phoneNumber.length !== 11) {
      toast.error("인원수와 전화번호를 확인하세요.");
      return;
    }
    submitMutation.mutate();
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  };

  const increasePartySize = () => {
    if (partySize >= 12) {
      return;
    }
    setPartySize(partySize + 1);
  };

  const decreasePartySize = () => {
    if (partySize <= 0) return;
    setPartySize(partySize - 1);
  };

  /* 60초 유휴는 사실상 "앞 손님이 등록을 포기하고 떠났다"는 뜻이다.
     그대로 두면 다음 손님이 화면을 깨웠을 때 남의 전화번호가 그대로 떠 있다
     — 개인정보 노출이자 오등록 경로다. 테이블오더가 장바구니를 지키는 것과
     정반대로 가는 이유는, 이쪽 손님은 한 번 쓰고 떠나는 사람이기 때문이다. */
  const resetForm = () => {
    setPartySize(0);
    setPhoneNumber("");
  };

  /* 세로에선 카드 위, 가로에선 왼쪽 컬럼 안 — 위치만 다르고 내용은 같아서 한 번만 정의한다 */
  const header = (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
        <Users className="w-8 h-8 text-white" />
      </div>
      <h1 className="mb-2 text-white">웨이팅 등록</h1>
      <p className="text-gray-400">인원수와 연락처를 입력해주세요</p>
    </div>
  );

  return (
    <TabletFrame>
      {/* 가로에선 세로 가운데 정렬 — 거치형 태블릿은 화면이 남아서 위로 붙이면 아래가 비어 보인다 */}
      <div className="relative min-h-screen xl:pointer-fine:min-h-full bg-linear-to-b from-gray-950 to-gray-900 p-6 lg:flex lg:items-center lg:justify-center">
        <div className="w-full max-w-2xl lg:max-w-5xl mx-auto">
          {/* 프레임이 씌워질 땐 프레임 바깥의 것을 쓴다 (TabletFrame 참고) */}
          <div className="mb-6 xl:pointer-fine:hidden">
            <BackToTour />
          </div>

          <div className="mb-8 lg:hidden">{header}</div>

          {/*
            세로(모바일·태블릿 세로): 카드 하나에 두 섹션.
            가로(lg+): 카드 배경을 자식으로 내려보내 인원수 | 키패드 2단으로 편다.
            거치형 태블릿은 가로가 기본이라 한 줄로 세우면 키패드가 화면 밖으로 밀린다.
          */}
          <div className="bg-gray-800 rounded-2xl p-8 space-y-8 lg:bg-transparent lg:p-0 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
            {/* 왼쪽 컬럼: 안내 + 인원수 — 헤더를 여기 넣어야 오른쪽 키패드와 무게가 맞는다 */}
            <div className="lg:flex lg:flex-col lg:gap-6">
              <div className="hidden lg:block">{header}</div>

              {/* 인원수 */}
              <div className="lg:flex-1 lg:bg-gray-800 lg:rounded-2xl lg:p-6 lg:flex lg:flex-col lg:justify-center">
                {/* 라벨 묶음 — 가로에선 부모가 flex-col이라 감싸지 않으면 두 줄로 흩어진다 */}
                <div className="mb-4 lg:mb-6 lg:text-center">
                  <span className="text-gray-300">인원수</span>
                  <span className="ml-1.5 text-gray-500">최대 12인</span>
                </div>
                {/* 가로에선 컨트롤을 키운다 — 거치형 태블릿은 서서 팔 뻗어 누르는 거리다 */}
                <div className="flex items-center justify-center gap-8 lg:gap-10">
                  <button
                    onClick={decreasePartySize}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl lg:text-3xl font-light transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-4xl lg:text-5xl font-bold text-white w-12 text-center">
                    {partySize}
                  </span>
                  <button
                    onClick={increasePartySize}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl lg:text-3xl font-light transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="lg:bg-gray-800 lg:rounded-2xl lg:p-6">
              <label className="flex items-center gap-2 mb-4 text-gray-300">
                <Phone className="w-5 h-5" />
                전화번호
              </label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:p-4 mb-4 text-center">
                <div className="text-3xl tracking-wider min-h-10 font-mono">
                  {formatPhoneNumber(phoneNumber) ? (
                    <span className="text-white">
                      {formatPhoneNumber(phoneNumber)}
                    </span>
                  ) : (
                    <span className="text-gray-600">010-0000-0000</span>
                  )}
                </div>
              </div>

              {/* 키패드 */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "완료"].map((key, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (key === "⌫") handleBackspace();
                      else if (key === "완료") handleSubmit();
                      else handleNumberInput(String(key));
                    }}
                    disabled={
                      key === "완료" &&
                      (!partySize || phoneNumber.length !== 11 || submitMutation.isPending)
                    }
                    className={`h-16 rounded-xl text-lg font-medium transition-all cursor-pointer ${
                      key === "완료"
                        ? "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                        : key === "⌫"
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* fixed가 아니라 absolute인 이유: 데스크톱에서는 TabletFrame이 베젤과
            기기 배지를 그리는데, 뷰포트 전체를 덮으면 "태블릿이 아니라 브라우저가
            광고판"이 된다. 이 div는 프레임의 화면 영역 안이라 모서리도
            조상의 rounded-2xl에 잘린다. 절대 위치라 lg:flex 배치에도 끼지 않는다. */}
        <Screensaver
          idleMs={60_000}
          enabled={!submitMutation.isPending}
          onWake={resetForm}
          className="absolute z-40 rounded-2xl"
        />
      </div>
    </TabletFrame>
  );
}
