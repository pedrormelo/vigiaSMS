// src/components/popups/IndeferirContextoModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileX, CornerUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IndeferirContextoModalProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onCancel: () => void;
    onConfirm: (comentario: string) => void | Promise<void>;
    contextoNome?: string;
    requireComment?: boolean;
    
    // [NOVAS PROPS PARA PERSONALIZAÇÃO]
    customTitle?: string;
    customDescription?: string;
    confirmText?: string;
    confirmButtonClass?: string;
}

export default function IndeferirContextoModal({
    open,
    onOpenChange,
    onCancel,
    onConfirm,
    contextoNome,
    requireComment = true,
    customTitle,
    customDescription,
    confirmText,
    confirmButtonClass
}: IndeferirContextoModalProps) {
    const [comentario, setComentario] = useState("");
    const [touched, setTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setComentario("");
            setTouched(false);
            setIsSubmitting(false);
        }
    }, [open]);

    const canConfirm = (!requireComment || comentario.trim().length > 0) && !isSubmitting;

    const handleConfirmClick = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm(comentario.trim());
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    // Define textos e ícones dinâmicos
    const isCorrecao = customTitle?.toLowerCase().includes('corre');
    const Icon = isCorrecao ? CornerUpLeft : FileX;
    const iconColor = isCorrecao ? "text-amber-600" : "text-red-600";
    
    const title = customTitle || "Indeferir contexto";
    const description = customDescription || (contextoNome ? (
        <>
            Você está prestes a indeferir o contexto <strong>{contextoNome}</strong>.
        </>
    ) : (
        "Você está prestes a indeferir este contexto."
    ));
    
    const buttonText = confirmText || "Confirmar indeferimento";
    // Se não passar classe customizada, usa a vermelha padrão.
    // Se passar (ex: âmbar para correção), usa ela e remove a vermelha.
    const buttonClass = confirmButtonClass || "bg-red-500 hover:bg-red-600 text-white";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", iconColor)} /> 
                        <span className="text-lg text-gray-700 font-semibold">{title}</span>
                    </DialogTitle>
                    <DialogDescription>
                        <span className="text-gray-700 block mb-1">
                            {description}
                        </span>
                        <span className="text-gray-700 text-sm">Informe o motivo/justificativa no campo abaixo.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <label htmlFor="comentario-indeferir" className="sr-only">
                        Motivo/justificativa
                    </label>
                    <textarea
                        id="comentario-indeferir"
                        className="w-full border shadow-inner border-gray-300 rounded-2xl py-2 px-4 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none leading-tight bg-white min-h-24"
                        placeholder="Descreva o motivo..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        onBlur={() => setTouched(true)}
                        disabled={isSubmitting}
                    />
                    {requireComment && touched && comentario.trim().length === 0 && (
                        <p className="mt-1 text-xs text-red-600">Campo obrigatório.</p>
                    )}
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border border-gray-300 hover:bg-gray-100"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        className={cn("cursor-pointer rounded-2xl transition-colors", buttonClass)}
                        disabled={!canConfirm}
                        onClick={handleConfirmClick}
                    >
                        {isSubmitting ? "Processando..." : buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}