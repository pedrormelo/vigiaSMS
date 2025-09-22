import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { BannerAlertVariant } from "@/constants/alerts"

interface ScheduleAlertProps {
    title?: string
    description?: string
    daysLate: number
    variant?: BannerAlertVariant
    className?: string
}

const config: Record<BannerAlertVariant, { border: string; icon: string; title: string; desc: string; defaultTitle: string }> = {
    atraso: {
        border: "border-orange-200 bg-orange-50 border-l-amber-400",
        icon: "!text-amber-600",
        title: "text-orange-800",
        desc: "text-amber-700",
        defaultTitle: "Atraso",
    },
    erro: {
        border: "border-red-200 bg-red-50 border-l-red-500",
        icon: "!text-red-600",
        title: "text-red-800",
        desc: "text-red-700",
        defaultTitle: "Erro crítico",
    },
    atualizacao: {
        border: "border-blue-200 bg-blue-50 border-l-blue-500",
        icon: "!text-blue-600",
        title: "text-blue-800",
        desc: "text-blue-700",
        defaultTitle: "Atualização",
    },
};

export function ScheduleAlert({
    title,
    description,
    daysLate,
    variant = "atraso",
    className,
}: ScheduleAlertProps) {
    const c = config[variant];
    return (
        <Alert className={cn("border-l-4 rounded-[6px]", c.border, className)}>
            <AlertTriangle className={cn("h-5 w-5 stroke-current", c.icon)} />
            <AlertTitle className={cn("font-semibold", c.title)}>
                {title || c.defaultTitle}
            </AlertTitle>
            <AlertDescription className={c.desc}>
                {description ||
                    `This component is ${daysLate} day${daysLate !== 1 ? "s" : ""} ${variant}. Immediate attention required to prevent project delays.`}
            </AlertDescription>
        </Alert>
    );
}
