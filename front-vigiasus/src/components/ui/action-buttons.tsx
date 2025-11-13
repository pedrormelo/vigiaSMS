import type React from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Check, X, AlertCircle, Trash2, Edit, Save } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "confirm" | "cancel" | "comment" | "danger" | "warning" | "success" | "info" | "purple" | "edit" | "save"
    size?: "sm" | "md" | "lg"
    children?: React.ReactNode
    icon?: boolean
}

export function ActionButton({
    variant = "confirm",
    size = "md",
    children,
    icon = true,
    className,
    ...props
}: ActionButtonProps) {
    const sizeClasses = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-13 px-8 text-lg",
    }

    const variantConfig = {
        confirm: {
            className:
                "bg-blue-500/30 backdrop-blur-xl border border-blue-300/30 hover:bg-blue-500/40 text-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:border-blue-400/50",
            icon: <Check className="w-4 h-4" />,
            defaultText: "Confirmar",
        },
        cancel: {
            className:
                "bg-gray-400/10 backdrop-blur-xl border border-gray-300/30 hover:bg-gray-400/20 text-gray-700 shadow-lg shadow-gray-500/10 hover:shadow-xl hover:shadow-gray-500/20 transition-all duration-300 hover:border-gray-400/50",
            icon: <X className="w-4 h-4" />,
            defaultText: "Cancelar",
        },
        comment: {
            className:
                "bg-amber-500/20 backdrop-blur-xl border border-amber-300/30 hover:bg-amber-500/30 text-amber-700 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:border-amber-400/50 font-semibold",
            icon: <MessageSquare className="w-4 h-4" />,
            defaultText: "Comentar",
        },
        danger: {
            className:
                "bg-red-500/20 backdrop-blur-xl border border-red-300/30 hover:bg-red-500/30 text-red-700 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:border-red-400/50",
            icon: <Trash2 className="w-4 h-4" />,
            defaultText: "Excluir",
        },
        warning: {
            className:
                "bg-orange-500/30 backdrop-blur-xl border border-orange-300/30 hover:bg-orange-500/40 text-orange-700 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:border-orange-400/50",
            icon: <AlertCircle className="w-4 h-4" />,
            defaultText: "Atenção",
        },
        success: {
            className:
                "bg-emerald-400/35 backdrop-blur-xl border border-emerald-400/30 hover:bg-emerald-400/60 text-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:border-emerald-400/50",
            icon: <Check className="w-4 h-4" />,
            defaultText: "Sucesso",
        },
        info: {
            className:
                "bg-cyan-400/20 backdrop-blur-xl border border-cyan-300/30 hover:bg-cyan-400/30 text-cyan-700 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:border-cyan-400/50",
            icon: <AlertCircle className="w-4 h-4" />,
            defaultText: "Informação",
        },
        purple: {
            className:
                "bg-purple-500/20 backdrop-blur-xl border border-purple-300/30 hover:bg-purple-500/30 text-purple-700 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:border-purple-400/50",
            icon: <MessageSquare className="w-4 h-4" />,
            defaultText: "Roxo",
        },
        edit: {
            className:
                "bg-indigo-500/30 backdrop-blur-xl border border-indigo-300/30 hover:bg-indigo-500/50 text-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:border-indigo-400/50",
            icon: <Edit className="w-4 h-4" />,
            defaultText: "Editar",
        },
        save: {
            className:
                "bg-teal-400/20 backdrop-blur-xl border border-teal-300/30 hover:bg-teal-400/40 text-teal-700 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:border-teal-400/50",
            icon: <Save className="w-4 h-4" />,
            defaultText: "Salvar",
        },
    }

    const config = variantConfig[variant]

    return (
        <Button
            className={cn(
                "rounded-2xl font-semibold tracking-wide flex items-center gap-2 active:scale-95 transition-transform",
                sizeClasses[size],
                config.className,
                className,
            )}
            {...props}
        >
            {icon && config.icon}
            {children || config.defaultText}
        </Button>
    )
}

// Individual button components for convenience
export function ConfirmButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="confirm" {...props} />
}

export function CancelButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="cancel" {...props} />
}

export function CommentButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="comment" {...props} />
}

export function DangerButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="danger" {...props} />
}

export function WarningButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="warning" {...props} />
}

export function SuccessButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="success" {...props} />
}

export function InfoButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="info" {...props} />
}

export function PurpleButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="purple" {...props} />
}

export function EditButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="edit" {...props} />
}

export function SaveButton(props: Omit<ActionButtonProps, "variant">) {
    return <ActionButton variant="save" {...props} />
}
