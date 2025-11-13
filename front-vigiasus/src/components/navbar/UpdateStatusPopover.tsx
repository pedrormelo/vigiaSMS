// src/components/navbar/UpdateStatusPopover.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Cloud, Clock, FileText } from "lucide-react";
import StatusBadge from "@/components/alerts/statusBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface UpdateStatusPopoverProps {
    lastUpdateRelative?: string;
    lastUpdateLabel?: string;
    lastUpdateItemName?: string | null;
    isRecent?: boolean;
}

export const UpdateStatusPopover: React.FC<UpdateStatusPopoverProps> = ({
    lastUpdateRelative,
    lastUpdateLabel,
    lastUpdateItemName,
    isRecent,
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="hover:opacity-70"
                    aria-label={`Última atualização do sistema ${lastUpdateRelative || "—"}`}
                >
                    <Image
                        src="/icons/online.svg"
                        alt="Última Atualização do Sistema"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                    />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                side="bottom"
                sideOffset={12}
                className="relative w-96 p-5 rounded-l-3xl rounded-br-3xl bg-gradient-to-br from-white/80 via-white/50 to-white/40 backdrop-blur-xl border border-gray-200 shadow-2xl"
            >
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl text-blue-700 flex items-center justify-center">
                            <Cloud className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-blue-700">Última atualização</div>
                            <div className="text-xs text-blue-500">Status e últimos envios</div>
                        </div>
                    </div>

                    {/* Status badge (dynamic) */}
                    <div>
                        <StatusBadge
                            variant={lastUpdateRelative && lastUpdateRelative !== "—" ? (isRecent ? "recent" : "stale") : "unknown"}
                            label={lastUpdateRelative ? `Atualizado ${lastUpdateRelative}` : "Sem informações"}
                            icon={Clock}
                        />
                    </div>

                    {/* Card */}
                    <div className="rounded-3xl border border-gray-200 bg-white/50 p-4 backdrop-blur-lg shwadow-sm shadow">
                        <div className="text-[11px] text-gray-600">Último contexto enviado</div>
                        <div className="mt-2 flex items-start gap-2">
                            <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-500/10 text-blue-700 flex items-center justify-center border border-blue-500/20">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate" title={lastUpdateItemName || ""}>
                                    {lastUpdateItemName ?? "—"}
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-gray-600">
                                    <Clock className="h-3.5 w-3.5" />
                                    {lastUpdateLabel || "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tail arrow (top-right), pointing to the cloud icon above */}
                {/* <div className="pointer-events-none absolute -top-2 right-3 h-3 w-3 rotate-45 bg-white/60 backdrop-blur-xl border border-gray-200 shadow" /> */}
            </PopoverContent>
        </Popover>
    );
};

export default UpdateStatusPopover;
