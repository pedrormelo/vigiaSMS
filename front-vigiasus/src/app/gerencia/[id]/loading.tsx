"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-white animate-in fade-in duration-300">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-blue-700 font-medium tracking-wide animate-pulse">
        Preparando tudo para você...
      </p>
    </div>
  );
}
