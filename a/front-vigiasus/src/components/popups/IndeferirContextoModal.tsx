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
import { FileX } from "lucide-react";

interface IndeferirContextoModalProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onCancel: () => void;
    onConfirm: (comentario: string) => void;
    contextoNome?: string;
    requireComment?: boolean;
}

export default function IndeferirContextoModal({
    open,
    onOpenChange,
    onCancel,
    onConfirm,
    contextoNome,
    requireComment = true,
}: IndeferirContextoModalProps) {
    const [comentario, setComentario] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (open) {
            setComentario("");
            setTouched(false);
        }
    }, [open]);

    const canConfirm = !requireComment || comentario.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileX className="h-5 w-5 text-red-600" /> <h1 className="text-lg text-gray-700 font-semibold">Indeferir contexto</h1>
                    </DialogTitle>
                    <DialogDescription>
                        {contextoNome ? (
                            <span className="text-gray-700">
                                Você está prestes a indeferir o contexto <strong>{contextoNome}</strong>.
                            </span>
                        ) : (
                            <span className="text-gray-700">Você está prestes a indeferir este contexto.</span>
                        )}
                        <br />
                        <h1 className="text-gray-700">Informe o motivo/justificativa no campo abaixo.</h1>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <label htmlFor="comentario-indeferir" className="sr-only">
                        Motivo/justificativa
                    </label>
                    <textarea
                        id="comentario-indeferir"
                        className="w-full border shadow-inner border-gray-300 rounded-2xl py-2 px-4 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none leading-tight bg-white  min-h-24"
                        placeholder="Descreva o motivo do indeferimento..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        onBlur={() => setTouched(true)}
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
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        className="cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-2xl"
                        disabled={!canConfirm}
                        onClick={() => onConfirm(comentario.trim())}
                    >
                        Confirmar indeferimento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
