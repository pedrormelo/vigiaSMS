"use client";

import { Loader2 } from "lucide-react";

interface GlobalLoadingProps {
  message?: string;
  subMessage?: string;
}

export default function GlobalLoading({
  message = "Carregando...",
  subMessage,
}: GlobalLoadingProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-blue-700 font-medium tracking-wide">
        {message}
      </p>
      {subMessage ? (
        <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
          {subMessage}
        </p>
      ) : null}
    </div>
  );
}
