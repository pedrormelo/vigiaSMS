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
            <DialogContent className="rounded-lg sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md w-11/12 max-w-sm sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    {/* ATUALIZADO: Estrutura do Título para corresponder ao IndeferirModal */}
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> {/* Ícone verde mantido */}
                        <span className="text-base sm:text-lg text-gray-700 font-semibold">Confirmar Deferimento</span>
                    </DialogTitle>
                    
                    {/* ATUALIZADO: Estrutura da Descrição para corresponder ao IndeferirModal */}
                    <DialogDescription>
                        {contextoNome ? (
                            <span className="text-gray-700 text-xs sm:text-sm">
                                Você está prestes a deferir o contexto <strong>{contextoNome}</strong>.
                            </span>
                        ) : (
                            <span className="text-gray-700 text-xs sm:text-sm">Você está prestes a deferir este contexto.</span>
                        )}
                        <br />
                        <span className="text-gray-700 text-xs sm:text-sm">Esta ação irá publicá-lo e (se aplicável) movê-lo para a próxima etapa de validação.</span>
                    </DialogDescription>
                </DialogHeader>

                {/* Sem campo de comentário, diferente do Indeferir */}

                {/* ATUALIZADO: Footer e Botões para corresponder ao IndeferirModal */}
                <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg sm:rounded-2xl border border-gray-300 hover:bg-gray-100 h-9 sm:h-10 text-xs sm:text-sm"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        // Classe do botão de confirmação (mantendo a cor verde)
                        className="cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-2xl h-9 sm:h-10 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5"
                        onClick={handleConfirmClick}
                    >
                        <FileCheck2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Confirmar deferimento</span><span className="sm:hidden">Confirmar</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeferirContextoModal;