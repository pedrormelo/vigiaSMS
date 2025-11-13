"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function CustomCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-2xl border border-gray-200"
        classNames={{
          // Header
          caption: "flex justify-between items-center px-4 py-3 text-lg font-semibold text-gray-700",
          caption_label: "text-base font-medium",
          nav: "flex items-center space-x-2",
          nav_button: cn(
            "p-2 rounded-full hover:bg-purple-100 text-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-purple-500"
          ),

          // Grid de dias
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "flex-1 text-center text-sm font-medium text-gray-500",
          row: "flex w-full mt-1",
          cell: "h-12 w-12 text-center flex items-center justify-center rounded-2xl cursor-pointer transition-colors",

          // Dias
          day: "h-10 w-10 flex items-center justify-center rounded-xl text-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500",
          day_today: "font-bold text-purple-600",
          day_outside: "text-gray-400 opacity-60",
          day_selected:
            "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:bg-purple-700",
        }}
      />
    </div>
  );
}
