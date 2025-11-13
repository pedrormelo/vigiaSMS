// src/components/validar/DateInputFilter.tsx
"use client";

import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/datePicker";
import { ArrowRight, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function DateInputFilter({ onDateChange }: Props) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    onDateChange({ from: startDate, to: endDate });
  }, [startDate, endDate, onDateChange]);
  
  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  }

  const hasFilter = startDate || endDate;

  return (
    <div className="relative group w-full max-w-70 h-26">
      
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Filtrar por Período
      </label>

      <div className={cn(
          "flex items-center gap-2 h-12 px-3", // Reduzido de px-4 para px-3
          "rounded-full transition-all duration-300",
          "bg-white/90 backdrop-blur-md shadow-md border-2",
          hasFilter 
            ? "border-blue-500 shadow-blue-100" 
            : "border-gray-200 hover:border-blue-300",
          "group-hover:shadow-lg"
      )}>
        
        <CalendarIcon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors duration-200",
          hasFilter ? "text-blue-500" : "text-gray-400"
        )} />
        
        <div className="flex-1 min-w-0">
          <DatePicker 
            date={startDate}
            setDate={setStartDate}
            disabled={endDate ? { after: endDate } : undefined} 
            className="border-none shadow-none h-full w-full bg-transparent hover:bg-gray-50/50 rounded-md px-1" // Reduzido padding interno
            popoverContentProps={{ className: "z-[100]" }}
            placeholder="Data Início"
            hideIcon
          />
        </div>

        <ArrowRight className={cn(
          "h-4 w-4 flex-shrink-0 transition-all duration-200",
          hasFilter ? "text-blue-500 scale-110" : "text-gray-400"
        )} />
        
        <div className="flex-1 min-w-0">
          <DatePicker 
            date={endDate}
            setDate={setEndDate}
            disabled={startDate ? { before: startDate } : undefined}
            className="border-none shadow-none h-full w-full bg-transparent hover:bg-gray-50/50 rounded-md px-1" // Reduzido padding interno
            popoverContentProps={{ className: "z-[100]" }}
            placeholder="Data Fim"
            hideIcon
          />
        </div>
        
        <div className="w-8 h-8 flex-shrink-0">
          {hasFilter && (
            <Button 
              onClick={handleClear} 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-full w-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <X className="h-4 w-4"/>
            </Button>
          )}
        </div>
      </div>
      
      {hasFilter && (
        <div className="mt-2 px-3 text-xs text-gray-600 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>
            {startDate && endDate 
              ? `${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`
              : startDate 
                ? `A partir de ${startDate.toLocaleDateString('pt-BR')}`
                : `Até ${endDate?.toLocaleDateString('pt-BR')}`
            }
          </span>
        </div>
      )}
    </div>
  );
}
