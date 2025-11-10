// src/components/popups/OcultarContextoModal.tsx
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
import { EyeOff, AlertTriangle } from "lucide-react";

interface OcultarContextoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    contextoNome: string;
}

const OcultarContextoModal = ({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    contextoNome
}: OcultarContextoModalProps) => {

    const handleConfirmClick = () => {
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h1 className="text-lg text-gray-700 font-semibold">Ocultar Contexto</h1>
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-gray-700">
                        Tem certeza que deseja ocultar o contexto <strong>"{contextoNome}"</strong>?
                        <br />
                        <span className="text-sm">Ele será removido da visualização principal, mas poderá ser reexibido pelo Modo de Edição.</span>
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
                        className="rounded-2xl bg-red-500 text-white hover:bg-red-700" 
                        onClick={handleConfirmClick}
                    >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Sim, Ocultar
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OcultarContextoModal;