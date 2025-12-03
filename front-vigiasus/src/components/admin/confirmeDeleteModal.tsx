// src/components/admin/ConfirmDeleteModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, KeyRound, AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    userName?: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, userName }: ConfirmDeleteModalProps) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        
        setLoading(true);
        try {
            await onConfirm(password);
            setPassword(""); // Limpa após sucesso
            onClose();
        } catch (error) {
            // Erro é tratado no pai, mas garantimos que o loading pare
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
            <DialogContent className="sm:max-w-[450px] bg-white rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" /> Excluir Usuário
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Você está prestes a excluir o usuário <strong>{userName}</strong>. <br/>
                        Esta ação é irreversível. Por favor, confirme com sua senha de administrador.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                            <KeyRound size={16} /> Senha do Admin
                        </label>
                        <input 
                            type="password"
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                            placeholder="Digite sua senha para confirmar"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-red-600 hover:bg-red-700 text-white gap-2" 
                            disabled={loading || !password}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            Confirmar Exclusão
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}