// src/components/alerts/statusBadge.tsx
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    AlertTriangle, CheckCircle2, Clock, HelpCircle, FileCheck, Send, AlertCircle, Eye, UserCog, UserCheck 
} from "lucide-react";
// --- 1. IMPORTAR O ENUM E O CONFIG ---
import { StatusContexto } from "@/components/validar/typesDados";
import { statusConfig as workflowStatusConfigMap } from "@/components/validar/colunasTable/statusConfig";


// --- Config 1: Staleness (do arquivo original) ---
type StatusVariant = "recent" | "stale" | "error" | "unknown";

const stalenessVariantClasses: Record<StatusVariant, string> = {
 recent: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-500/30 hover:ring-emerald-600/60 hover:text-emerald-600",
 stale: "bg-amber-500/15 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-500/30 hover:ring-amber-600/60 hover:text-amber-600",
 error: "bg-red-500/15 text-red-700 ring-1 ring-red-600/20 hover:bg-red-500/30 hover:ring-red-600/60 hover:text-red-600",
 unknown: "bg-gray-500/10 text-gray-700 ring-1 ring-gray-600/20 hover:bg-gray-500/30 hover:ring-gray-600/60 hover:text-gray-600",
};

const stalenessDefaultIcons: Record<StatusVariant, React.ElementType<{ className?: string }>> = {
 recent: CheckCircle2,
 stale: Clock,
 error: AlertTriangle,
unknown: HelpCircle,
};
// --- Fim Config 1 ---


// --- 2. ADICIONAR MAPEAMENTO DE ÍCONES PARA WORKFLOW ---
// O 'statusConfig' importado já tem 'text' e 'className', só precisamos dos ícones
const workflowStatusIcons: Record<StatusContexto, React.ElementType> = {
    [StatusContexto.Publicado]: CheckCircle2,
    [StatusContexto.AguardandoGerente]: Send,
    [StatusContexto.AguardandoDiretor]: UserCheck, // ou Eye
    [StatusContexto.AguardandoCorrecao]: AlertTriangle,
    [StatusContexto.Deferido]: CheckCircle2, // (raro, mas para completar)
    [StatusContexto.Indeferido]: AlertCircle,
};
// --- Fim Config 2 ---


// --- 3. ATUALIZAR PROPS ---
export interface StatusBadgeProps {
// Props de Staleness (usadas no topo da página)
    variant?: StatusVariant;
label?: string;
    
    // Props de Workflow (usadas nos cards)
    status?: StatusContexto; // <-- Aceita o status do fluxo

 icon?: React.ElementType<{ className?: string }>;
className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
    variant, 
    label, 
    status, // Agora recebemos o 'status'
    icon: Icon, // Icon customizado (opcional)
    className 
}) => {
    
    let IconToRender: React.ElementType<{ className?: string }>;
    let computedLabel: string;
    let computedClassName: string;

    // --- 4. LÓGICA DE DECISÃO ---
    if (status) {
        // --- Lógica para Workflow Status (usada nos cards) ---
        const config = workflowStatusConfigMap[status] || { text: "Desconhecido", className: stalenessVariantClasses.unknown };
        IconToRender = Icon || workflowStatusIcons[status] || HelpCircle;
        computedLabel = config.text;
        computedClassName = config.className;
        
    } else if (variant && label) {
        // --- Lógica para Staleness Variant (usada no topo da página) ---
        IconToRender = Icon || stalenessDefaultIcons[variant];
        computedLabel = label;
        computedClassName = stalenessVariantClasses[variant];

    } else {
        // Fallback se nada for passado
        return <Badge className={stalenessVariantClasses.unknown}><HelpCircle className="h-3.5 w-3.5" /> Erro</Badge>;
    }
    
    // Fallback final para caso o ícone ainda seja indefinido
    if (!IconToRender) {
         IconToRender = HelpCircle; 
    }

    return (
 <Badge className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium", computedClassName, className)}>
<IconToRender className="h-3.5 w-3.5" />
 {computedLabel}
 </Badge>
);
};

export default StatusBadge;