// src/components/alerts/statusBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, HelpCircle } from "lucide-react";

type StatusVariant = "recent" | "stale" | "error" | "unknown";

export interface StatusBadgeProps {
    variant: StatusVariant;
    label: string;
    icon?: React.ElementType<{ className?: string }>;
    className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
    recent: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-500/30 hover:ring-emerald-600/60 hover:text-emerald-600",
    stale: "bg-amber-500/15 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-500/30 hover:ring-amber-600/60 hover:text-amber-600",
    error: "bg-red-500/15 text-red-700 ring-1 ring-red-600/20 hover:bg-red-500/30 hover:ring-red-600/60 hover:text-red-600",
    unknown: "bg-gray-500/10 text-gray-700 ring-1 ring-gray-600/20 hover:bg-gray-500/30 hover:ring-gray-600/60 hover:text-gray-600",
};

const defaultIcons: Record<StatusVariant, React.ElementType<{ className?: string }>> = {
    recent: CheckCircle2,
    stale: Clock,
    error: AlertTriangle,
    unknown: HelpCircle,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label, icon: Icon, className }) => {
    const IconToRender = Icon || defaultIcons[variant];
    return (
        <Badge className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium", variantClasses[variant], className)}>
            <IconToRender className="h-3.5 w-3.5" />
            {label}
        </Badge>
    );
};

export default StatusBadge;
