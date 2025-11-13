// src/components/ui/datePicker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PopoverContentProps } from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
  placeholder?: string;
  popoverContentProps?: Omit<PopoverContentProps, "children">;
  hideIcon?: boolean;
}

export function DatePicker({
  date,
  setDate,
  className,
  disabled,
  placeholder = "Selecione uma data",
  popoverContentProps,
 // hideIcon = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          aria-label="Selecionar data"
          className={cn(
            "w-full justify-start text-left font-normal",
            "transition-all duration-200 ease-in-out",
            "hover:bg-transparent",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
            !date && "text-muted-foreground",
            "border-0 shadow-none",
            "h-full px-2",
            className
          )}
        >
          {date ? (
            <span className="font-medium text-gray-900 text-sm">
              {format(date, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
  className={cn(
    "w-auto p-0",
    "z-[100]",
    "bg-white/95 backdrop-blur-lg",
    "border border-gray-200/80",
    "shadow-2xl",
    "rounded-xl",
    "animate-in fade-in-0 zoom-in-95",
    "overflow-hidden", // IMPORTANTE: previne overflow
    popoverContentProps?.className
  )}
  align="start"
  sideOffset={8}
  {...popoverContentProps}
>
  <Calendar
    mode="single"
    selected={date}
    onSelect={(selectedDate) => {
      setDate(selectedDate);
      setIsOpen(false);
    }}
    disabled={disabled}
    autoFocus
    locale={ptBR}
  />
  
  {date && (
    <div className="border-t border-gray-100 pt-3 pb-3 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setDate(undefined);
          setIsOpen(false);
        }}
        className="w-full text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        Limpar seleção
      </Button>
    </div>
  )}
</PopoverContent>

    </Popover>
  );
}
