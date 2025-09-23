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
    <div className="relative group w-full max-w-md">
      {/* Rótulo Flutuante com lógica ajustada */}
      <p className={cn(
          "absolute left-12 px-1 text-sm text-gray-500 transition-all duration-200 ease-in-out pointer-events-none z-10",
          hasFilter 
            ? "-top-2 text-xs bg-gray-50" 
            : "top-1/2 -translate-y-1/2"
        )}
      >
        Filtrar por Período
      </p>

      <div className={cn(
          "flex items-center gap-1 h-14 pl-4 pr-2 border rounded-full bg-transparent transition-all duration-200",
          hasFilter ? "border-blue-500" : "border-gray-300",
          "group-hover:border-blue-500"
      )}>
        <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        
        {/* O DatePicker agora é apenas o "motor" do calendário, sem visual próprio */}
        <div className="flex-1 min-w-0">
          <DatePicker 
            date={startDate}
            setDate={setStartDate}
            disabled={endDate ? { after: endDate } : undefined} 
            className="border-none shadow-none h-full w-full text-center"
          />
        </div>

        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <DatePicker 
            date={endDate}
            setDate={setEndDate}
            disabled={startDate ? { before: startDate } : undefined}
            className="border-none shadow-none h-full w-full text-center"
          />
        </div>
        
        <div className="w-8 h-8 flex-shrink-0">
            {hasFilter && (
            <Button onClick={handleClear} variant="ghost" size="icon" className="rounded-full h-full w-full text-gray-400 hover:text-red-500 hover:bg-red-50">
                <X className="h-4 w-4"/>
            </Button>
            )}
        </div>
      </div>
    </div>
  );
}