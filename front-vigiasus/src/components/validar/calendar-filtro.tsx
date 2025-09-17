"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar-filter"; // Importamos o nosso calendário de base

export type CalendarWithNavigationProps = React.ComponentProps<typeof DayPicker>;

export default function CalendarWithNavigation({ ...props }: CalendarWithNavigationProps) {
  return (
    <Calendar
      // Ativamos o layout de dropdowns da biblioteca base
      captionLayout="dropdown-nav"
      // Informamos um intervalo de anos para os dropdowns
      fromYear={new Date().getFullYear() - 5}
      toYear={new Date().getFullYear() + 5}
      // Passamos os nossos componentes de Select personalizados para estilizar os dropdowns
      components={{
        Dropdown: ({ value, onChange, children }: DropdownProps) => {
          const options = React.Children.toArray(
            children
          ) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (newValue: string) => {
            const changeEvent = {
              target: { value: newValue },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(newValue) => handleChange(newValue)}
            >
              <SelectTrigger className="pr-1.5 focus:ring-0 h-8 text-sm">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                <ScrollArea className="h-80">
                  {options.map((option, id: number) => (
                    <SelectItem
                      key={`${option.props.value}-${id}`}
                      value={option.props.value?.toString() ?? ""}
                    >
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
      }}
      {...props} // Passamos todas as outras props (como mode, selected, onSelect) para o calendário de base
    />
  );
}