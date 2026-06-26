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
      <div className="relative rounded-2xl border border-cyan-500/30 bg-white p-4 glow-accent-strong">
        <div className="pointer-events-none absolute inset-0 rounded-2xl scanline opacity-30" />
        <QRCodeSVG value={value} size={size} level="M" includeMargin fgColor="#050508" />
      </div>
      {label && (
        <p className="text-center font-mono text-xs tracking-widest text-cyan-400/80">
          {label}
        </p>
      )}
    </div>
  );
}
