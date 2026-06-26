"use client";

import { QRCodeSVG } from "qrcode.react";

export function TipQRCode({
  value,
  label,
  size = 200,
}: {
  value: string;
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border-4 border-emerald-600/10 bg-white p-4 shadow-inner">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin
          fgColor="#065f46"
        />
      </div>
      {label && (
        <p className="text-center text-xs font-medium text-stone-500">{label}</p>
      )}
    </div>
  );
}
