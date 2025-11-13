"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AdicionarLeiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (titulo: string) => void;
}

export default function AdicionarLeiModal({
  open,
  onOpenChange,
  onSave,
}: AdicionarLeiModalProps) {
  const [titulo, setTitulo] = useState("");

  const handleAdd = () => {
    if (!titulo.trim()) return;
    onSave(titulo);
    setTitulo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar nova lei</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          placeholder="Digite o título da lei..."
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <DialogFooter>
          <Button onClick={handleAdd}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
