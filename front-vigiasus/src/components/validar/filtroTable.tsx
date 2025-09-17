// src/components/validar/DateRangeFilter.tsx
"use client";

import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-filter"; // Verifique se o caminho está correto
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator"; // Usado para dividir o layout

interface Props {
  className?: string;
  onDateChange: (range: DateRange | undefined) => void;
}

// Componente para os botões de atalho
function DatePresetButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <Button variant="ghost" size="sm" className="w-full justify-start font-normal" onClick={onClick}>
            {label}
        </Button>
    )
}

export default function DateRangeFilter({ className, onDateChange }: Props) {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectDate = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    onDateChange(selectedRange);
    // Não fecha o popover automaticamente para permitir a seleção de presets
  };
  
  const handleClearFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setDate(undefined);
    onDateChange(undefined);
  };
  
  // Funções para definir os intervalos predefinidos
  const setPreset = (preset: 'today' | 'last7' | 'thisMonth') => {
    const today = new Date();
    let newRange: DateRange | undefined;
    if (preset === 'today') {
        newRange = { from: today, to: today };
    }
    if (preset === 'last7') {
        newRange = { from: subDays(today, 6), to: today };
    }
    if (preset === 'thisMonth') {
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
    }
    setDate(newRange);
    onDateChange(newRange);
    setIsOpen(false); // Fecha o popover após selecionar um atalho
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            className={cn(
              "flex h-12 w-auto min-w-[300px] cursor-pointer items-center rounded-full border border-input bg-background px-4 py-2 text-left text-sm ring-offset-background transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !date && "text-muted-foreground hover:border-primary",
              date && "border-primary bg-primary/10 text-primary"
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 flex-shrink-0" />
            <div className="flex-grow truncate">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd 'de' LLL, y", { locale: ptBR })} -{" "}
                      {format(date.to, "dd 'de' LLL, y", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "dd 'de' LLL, y", { locale: ptBR })
                  )
                ) : (
                  <span>Filtrar por data</span>
                )}
            </div>
            {date && (
                <Button
                    onClick={handleClearFilter}
                    variant="ghost"
                    className="ml-2 h-6 w-6 rounded-full p-0 opacity-60 hover:opacity-100 hover:bg-primary/20"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Secção de atalhos à esquerda */}
            <div className="flex flex-col space-y-2 p-2 pr-4 border-r">
                <DatePresetButton label="Hoje" onClick={() => setPreset('today')} />
                <DatePresetButton label="Últimos 7 dias" onClick={() => setPreset('last7')} />
                <DatePresetButton label="Este mês" onClick={() => setPreset('thisMonth')} />
            </div>
            {/* Calendário à direita */}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelectDate}
              numberOfMonths={1} // Usamos 1 mês para dar espaço aos atalhos
              locale={ptBR}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}