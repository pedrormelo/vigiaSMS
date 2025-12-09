// src/components/popups/addContextoModal/addLinkModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe2, FileSymlink, XCircle } from "lucide-react";

interface AddLinkModalProps {
    open: boolean;
    onClose: () => void; // fecha sem confirmar
    onConfirm: (url: string) => void; // confirma e envia url
    initialUrl?: string;
}

const isValidUrl = (value: string): boolean => {
    try {
        const u = new URL(value.trim());
        return /^https?:$/.test(u.protocol);
    } catch {
        return false;
    }
};

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ open, onClose, onConfirm, initialUrl = "" }) => {
    const [url, setUrl] = useState(initialUrl);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (open) {
            setUrl(initialUrl);
            setTouched(false);
        }
    }, [open, initialUrl]);

    const handleConfirm = () => {
        setTouched(true);
        if (!isValidUrl(url)) return;
        onConfirm(url.trim());
    };

    const showError = touched && !isValidUrl(url);

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="sm:rounded-2xl bg-white/80 border border-gray-300 shadow-2xl backdrop-blur-md max-w-[90vw] sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-blue-600" />
                        <span className="text-base sm:text-lg text-gray-700 font-semibold">Adicionar Link</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-gray-700">
                        Informe a URL pública (http/https) que referencia a fonte do contexto.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-2 space-y-2">
                    <label className="text-sm font-medium text-gray-600">URL</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            inputMode="url"
                            placeholder="https://exemplo.com/arquivo.pdf"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onBlur={() => setTouched(true)}
                            className={`flex-1 h-11 sm:h-auto px-4 py-2.5 rounded-xl border bg-white/70 outline-none focus:ring-2 transition ${showError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        />
                        {showError && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </div>
                    {showError && <p className="text-xs text-red-600">Informe uma URL válida começando com http:// ou https://</p>}
                </div>
                <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 sm:h-auto rounded-2xl border border-gray-300 hover:bg-gray-100 w-full sm:w-auto"
                        onClick={onClose}
                    >Cancelar</Button>
                    <Button
                        type="button"
                        className="h-11 sm:h-auto cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-2xl disabled:opacity-60 w-full sm:w-auto"
                        disabled={!isValidUrl(url)}
                        onClick={handleConfirm}
                    >
                        <FileSymlink className="mr-1.5 h-4 w-4" /> Confirmar Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddLinkModal;