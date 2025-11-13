// src/components/popups/DeferirContextoModal.tsx
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCheck2, CheckCircle } from 'lucide-react';

interface DeferirContextoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
    contextoNome: string;
}

/**
 * Modal de confirmação para a ação de Deferir.
 * Segue o mesmo padrão visual do IndeferirContextoModal.
 */
export function DeferirContextoModal({
    open,
    onOpenChange,
    onCancel,
    onConfirm,
    contextoNome,
}: DeferirContextoModalProps) {

    const handleConfirmClick = () => {
        onConfirm();
    };

    const handleCancelClick = () => {
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* ATUALIZADO: Classe do DialogContent para corresponder ao IndeferirModal */}
            <DialogContent className="sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md">
                <DialogHeader>
                    {/* ATUALIZADO: Estrutura do Título para corresponder ao IndeferirModal */}
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" /> {/* Ícone verde mantido */}
                        <h1 className="text-lg text-gray-700 font-semibold">Confirmar Deferimento</h1>
                    </DialogTitle>
                    
                    {/* ATUALIZADO: Estrutura da Descrição para corresponder ao IndeferirModal */}
                    <DialogDescription>
                        {contextoNome ? (
                            <span className="text-gray-700">
                                Você está prestes a deferir o contexto <strong>{contextoNome}</strong>.
                            </span>
                        ) : (
                            <span className="text-gray-700">Você está prestes a deferir este contexto.</span>
                        )}
                        <br />
                        <h1 className="text-gray-700">Esta ação irá publicá-lo e (se aplicável) movê-lo para a próxima etapa de validação.</h1>
                    </DialogDescription>
                </DialogHeader>

                {/* Sem campo de comentário, diferente do Indeferir */}

                {/* ATUALIZADO: Footer e Botões para corresponder ao IndeferirModal */}
                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border border-gray-300 hover:bg-gray-100"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        // Classe do botão de confirmação (mantendo a cor verde)
                        className="cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                        onClick={handleConfirmClick}
                    >
                        <FileCheck2 className="mr-1.5 h-4 w-4" />
                        Confirmar deferimento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeferirContextoModal;