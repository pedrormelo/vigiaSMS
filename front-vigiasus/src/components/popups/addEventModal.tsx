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
import { Plus, ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: {
    date: Date;
    title: string;
    location: string;
  }) => void;
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
}: AddEventModalProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!date || !title || !location) return;

    setIsSaving(true);

    // simulação de delay (poderia ser chamada API)
    setTimeout(() => {
      onSave({ date, title, location });
      setIsSaving(false);
      onClose();
      setDate(undefined);
      setTitle("");
      setLocation("");
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-transparent border-none p-0 shadow-none">
        <div className="bg-white rounded-4xl shadow-2xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-4xl flex-row items-center justify-between">
            <div className="flex ml-3 items-center gap-3">
              <CalendarDays className="text-white" />
              <span className="text-white text-2xl">Adicionar Evento</span>
              <DialogTitle className="text-white "></DialogTitle>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="rounded-full hover:bg-white/20"
            >
              <ArrowLeft className="text-white" />
            </Button>
          </DialogHeader>

          {/* Corpo */}
          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Calendário customizado */}
            <div className="flex-1 flex justify-center items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="rounded-2xl border border-gray-200 p-4 min-h-[380px]"
                classNames={{
                  caption: "flex justify-between items-center px-2 py-2 text-lg font-semibold text-gray-700",
                  nav: "flex items-center space-x-2",
                  nav_button: cn(
                    "p-2 rounded-full hover:bg-purple-100 text-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ),
                  head_row: "flex",
                  head_cell: "flex-1 text-center text-sm font-medium text-gray-500",
                  row: "flex w-full mt-1",
                  cell: "h-12 w-12 text-center flex items-center justify-center rounded-2xl cursor-pointer transition-colors",
                  day: "h-10 w-10 flex items-center justify-center rounded-xl text-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  day_today: "font-bold text-purple-600",
                  day_outside: "text-gray-400 opacity-60",
                  day_selected:
                    "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:bg-purple-700",
                }}
              />
            </div>

            {/* Inputs */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Data escolhida */}
              {date && (
                <div className="text-center font-medium text-gray-700">
                  Data escolhida:{" "}
                  <span className="text-purple-600 font-semibold">
                    {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}

              {/* Título */}
              <input
                type="text"
                placeholder="Título do Evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-gray-300 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-purple-500"
              />

              {/* Local */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-2xl p-3 text-sm">
                <MapPin className="text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Local do Evento"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <DialogFooter className="p-6 pt-0 sm:justify-center gap-4">
            <Button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-2xl px-8 py-3 text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!date || !title || !location || isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-8 py-3 text-base"
            >
              {isSaving ? "Salvando..." : (
                <>
                  <Plus className="mr-2" size={20} />
                  Salvar Evento
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
