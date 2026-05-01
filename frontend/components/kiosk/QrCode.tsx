"use client";

import QRCode from "react-qr-code";

export default function QrCode({ value }: { value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl inline-block">
      <QRCode value={value} size={160} />
    </div>
  );
}
