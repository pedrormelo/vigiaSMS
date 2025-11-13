// src/components/indicadores/indicadorCard.tsx
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { StatusContexto } from "@/components/validar/typesDados" 
import StatusBadge from "@/components/alerts/statusBadge" 
import { Badge } from "@/components/ui/badge"; // <-- 1. Importar Badge
import { 
    Hospital,
    HeartPulse,
    Activity,
    Cross,
    HeartHandshake,
    ClipboardPlus,
    Stethoscope,
    Ambulance,
    Clock, 
    EyeOff // <-- 2. Importar EyeOff
} from 'lucide-react';

// (icons e borderColors permanecem os mesmos)
export const icons = {
    unidades: (
        <Hospital className="w-4 h-4" />
    ),
    cuidados: (
        <HeartPulse className="w-4 h-4" />
    ),
    atividade: (
        <Activity className="w-4 h-4" />
    ),
    cruz: (
        <Cross className="w-4 h-4" />
    ),
    populacao: (
        <HeartHandshake className="w-4 h-4" />
    ),
    servidores: (
        <ClipboardPlus className="w-4 h-4" />
    ),
    medicos: (
        <Stethoscope className="w-4 h-4" />
    ),
    ambulancia: (
        <Ambulance className="w-4 h-4" />
    ),
}
export const borderColors = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    red: "border-l-red-500",
    yellow: "border-l-yellow-500",
    purple: "border-l-purple-500",
    orange: "border-l-orange-500",
    teal: "border-l-teal-500",
    pink: "border-l-pink-500",
}

// 3. ATUALIZAR A INTERFACE DE PROPS
interface IndicatorCardProps {
    title: string
    value: string
    subtitle: string
    status: StatusContexto; 
    estaOculto?: boolean; // <-- ADICIONADO
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    borderColor: keyof typeof borderColors | string
    iconType: keyof typeof icons
    valuePrefix?: string
    valueSuffix?: string
    onClick?: () => void
}


export function IndicatorCard({
    title,
    value,
    subtitle,
    status, 
    estaOculto = false, // <-- 4. RECEBER A PROP
    change,
    changeType = "neutral",
    borderColor,
    iconType,
    valuePrefix = "",
    valueSuffix = "",
    onClick,
}: IndicatorCardProps) {
    const borderClass = borderColor in borderColors ? borderColors[borderColor as keyof typeof borderColors] : borderColor
    
    const isPublished = status === StatusContexto.Publicado;

    return (
        <Card className={cn(
            "relative p-3 min-w-[240px] h-24 border-l-4 border-gray-200 rounded-[5px] bg-white shadow-sm overflow-hidden transition-all duration-200", 
            borderClass,
            onClick && "cursor-pointer",
            
            // 5. ATUALIZAR LÓGICA DE ESTILO
            // Se não estiver publicado OU se estiver oculto, aplica o estilo desabilitado
            (!isPublished || estaOculto)
                ? "opacity-70 grayscale-[80%] hover:opacity-100 hover:grayscale-0" 
                : (onClick ? "hover:scale-105" : "") 
        )}
        onClick={onClick}
        title={isPublished ? title : `${title} (Status: ${status})`} 
        >
            
            {/* --- 6. CONTAINER DE BADGES ATUALIZADO --- */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                {/* Badge de Status (se não publicado) */}
                {!isPublished && (
                    <StatusBadge status={status} />
                )}
                
                {/* Badge de Oculto (se oculto) */}
                {estaOculto && (
                    <Badge className="bg-gray-700/80 text-white border-none py-1 px-2" title="Este indicador está oculto da visualização padrão">
                        <EyeOff className="w-3.5 h-3.5" />
                    </Badge>
                )}
            </div>
            
            {!isPublished && (
                 <Clock className="absolute -right-2 -bottom-2 w-16 h-16 text-black/5 z-0" strokeWidth={1.5} />
            )}


            {/* 7. ATUALIZAR LÓGICA DE PADDING DO CONTEÚDO */}
            <div className={cn(
                "relative z-10 flex items-start justify-between h-full",
                // Se não estiver publicado OU se estiver oculto, aplica o padding-top
                (!isPublished || estaOculto) && "pt-5" 
            )}>
                <div className="flex flex-col justify-between h-full flex-1 min-w-0 pr-2">
                    <div>
                        <h3 className={cn(
                            "text-sm font-medium text-gray-700 mb-0 leading-tight truncate"
                        )}>
                            {title}
                        </h3>
                        <p className="text-xl font-bold text-gray-900 leading-none">
                            {valuePrefix}
                            {value}
                            {valueSuffix}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight break-words mt-0.5">{subtitle}</p>
                        {change && (
                            <div
                                className={cn(
                                    "text-[11px] flex items-center gap-0.5 mt-1",
                                    changeType === "positive" && "text-green-600",
                                    changeType === "negative" && "text-red-600",
                                    changeType === "neutral" && "text-gray-500",
                                )}
                            >
                                {changeType === "positive" && <span>▲</span>}
                                {changeType === "negative" && <span>▼</span>}
                                {changeType === "neutral" && <span className="font-bold">—</span>}
                                <span>{change.replace("— ", "")}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end justify-start h-full flex-shrink-0">
                    <div className="text-gray-400">{icons[iconType]}</div>
                </div>
            </div>
        </Card>
    )
}