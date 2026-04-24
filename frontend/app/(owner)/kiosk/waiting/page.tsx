"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const [partySize, setPartySize] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const partySizes = [1, 2, 3, 4, 5, 6];

  const handleNumberInput = (num: string) => {
    if (phoneNumber.length < 11) {
      setPhoneNumber(phoneNumber + num);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleSubmit = () => {
    if (partySize && phoneNumber.length === 11) {
      // 더미 데이터로 등록 완료 페이지로 이동
      router.push("/kiosk/complete");
      /*
, {
        state: {
          waitingNumber: 12,
          partySize,
          phoneNumber: phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"),
        },
      }
      */
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors no-underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">웨이팅 등록</h1>
          <p className="text-muted-foreground">
            인원수와 연락처를 입력해주세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* 인원수 선택 */}
          <div>
            <label className="block mb-4">인원수</label>
            <div className="grid grid-cols-3 gap-3">
              {partySizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setPartySize(size)}
                  className={`h-20 rounded-xl border-2 transition-all ${
                    partySize === size
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white hover:border-primary/50"
                  }`}
                >
                  {size}명
                </button>
              ))}
            </div>
          </div>

          {/* 전화번호 입력 */}
          <div>
            <label className="block mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              전화번호
            </label>
            <div className="bg-accent rounded-xl p-6 mb-4 text-center">
              <div className="text-3xl tracking-wider min-h-[2.5rem]">
                {formatPhoneNumber(phoneNumber) || "010-0000-0000"}
              </div>
            </div>

            {/* 숫자 키패드 */}
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
                    key === "완료" && (!partySize || phoneNumber.length !== 11)
                  }
                  className={`h-16 rounded-xl font-medium transition-all ${
                    key === "완료"
                      ? "bg-primary text-white hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed col-span-1"
                      : key === "⌫"
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-accent hover:bg-accent/80"
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
