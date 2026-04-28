"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const [partySize, setPartySize] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNumberInput = (num: string) => {
    if (phoneNumber.length < 11) {
      setPhoneNumber(phoneNumber + num);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!partySize || phoneNumber.length !== 11) {
      toast.error("인원수와 전화번호를 확인하세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/waiting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, partySize }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      router.push(`/kiosk/complete?id=${data.id}`);
    } catch {
      toast.error("웨이팅 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  };

  const increasePartySize = () => setPartySize(partySize + 1);

  const decreasePartySize = () => {
    if (partySize <= 0) return;
    setPartySize(partySize - 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 mb-6 hover:text-white transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2 text-white">웨이팅 등록</h1>
          <p className="text-gray-400">인원수와 연락처를 입력해주세요</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 space-y-8">
          {/* 인원수 */}
          <div>
            <span className="mb-4 text-gray-300">인원수</span>
            <span className="ml-1.5 text-gray-500">최대 12인</span>
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={decreasePartySize}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl font-light transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="text-4xl font-bold text-white w-12 text-center">
                {partySize}
              </span>
              <button
                onClick={increasePartySize}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl font-light transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="flex items-center gap-2 mb-4 text-gray-300">
              <Phone className="w-5 h-5" />
              전화번호
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-4 text-center">
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
                    (!partySize || phoneNumber.length !== 11 || isSubmitting)
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
    </div>
  );
}
