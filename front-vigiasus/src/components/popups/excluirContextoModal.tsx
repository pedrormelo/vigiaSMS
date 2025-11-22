// src/components/popups/excluirContextoModal.tsx
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Undo2 } from "lucide-react"; // Adicionado Undo2

interface ExcluirContextoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    contextoNome: string;
    // [NOVO] Opcional: para mudar o ícone/texto se for apenas rollback
    isMultiplaVersao?: boolean; 
}

const ExcluirContextoModal = ({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    contextoNome,
    isMultiplaVersao = false
}: ExcluirContextoModalProps) => {

    const handleConfirmClick = () => {
        onConfirm();
    };

    const title = isMultiplaVersao ? "Cancelar Nova Versão" : "Excluir Contexto";
    const Icon = isMultiplaVersao ? Undo2 : AlertTriangle;
    const confirmText = isMultiplaVersao ? "Sim, Cancelar Versão" : "Sim, Excluir";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-red-600" />
                        <span className="text-lg text-gray-700 font-semibold">{title}</span>
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-gray-700">
                        {isMultiplaVersao ? (
                             <>
                                Deseja cancelar a solicitação de atualização para <strong>"{contextoNome}"</strong>?
                                <br />
                                <span className="text-sm mt-2 block text-gray-600">
                                    A versão anterior aprovada voltará a ser a ativa.
                                </span>
                             </>
                        ) : (
                            <>
                                Tem certeza que deseja excluir o contexto <strong>"{contextoNome}"</strong>?
                                <br />
                                <span className="text-sm mt-2 block text-gray-600">
                                    O item será movido para a <strong>Lixeira</strong> e excluído definitivamente após <strong>90 dias</strong>.
                                </span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl border border-gray-300 bg-white hover:bg-gray-100"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    
                    <Button
                        type="button"
                        className="rounded-2xl bg-red-600 text-white hover:bg-red-700 shadow-md" 
                        onClick={handleConfirmClick}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {confirmText}
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExcluirContextoModal;