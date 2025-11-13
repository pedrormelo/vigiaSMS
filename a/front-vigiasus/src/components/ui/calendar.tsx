"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white/95 backdrop-blur-lg",
        "rounded-xl p-4",
        "w-full max-w-[320px]",
        "shadow-sm",
        "group/calendar",
        "[--cell-size:2.25rem]",
        // Aplicar estilos de tabela aqui
        "[&_table]:w-full [&_table]:border-collapse [&_table]:border-spacing-0",
        "[&_td]:border-0 [&_th]:border-0 [&_tr]:border-0",
        "[&_tbody]:border-0 [&_thead]:border-0",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("pt-BR", { month: "short" }),
        formatWeekdayName: (date) =>
          date.toLocaleString("pt-BR", { weekday: "narrow" }).toUpperCase(),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4",
          defaultClassNames.months
        ),
        month: cn(
          "flex w-full flex-col gap-3",
          defaultClassNames.month
        ),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 select-none p-0",
          "hover:bg-blue-50/80 hover:text-blue-600 transition-all duration-200",
          "aria-disabled:opacity-30 aria-disabled:cursor-not-allowed",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 select-none p-0",
          "hover:bg-blue-50/80 hover:text-blue-600 transition-all duration-200",
          "aria-disabled:opacity-30 aria-disabled:cursor-not-allowed",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center px-8",
          "font-semibold text-gray-900 text-sm",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-lg border border-gray-200/50",
          "bg-white/60 backdrop-blur-sm shadow-sm",
          "has-focus:border-blue-400 has-focus:ring-blue-400/30 has-focus:ring-2",
          "transition-all duration-200",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-white/90 backdrop-blur-md absolute inset-0 opacity-0 cursor-pointer",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-gray-900",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1.5 rounded-lg pl-3 pr-2 text-sm bg-white/40 backdrop-blur-sm border border-gray-200/50 hover:bg-white/60 transition-all [&>svg]:text-gray-600 [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        weekdays: cn(
          "flex w-full mt-2",
          defaultClassNames.weekdays
        ),
        weekday: cn(
          "text-gray-600 flex-1 select-none text-center",
          "text-[0.65rem] font-bold uppercase tracking-wider",
          "w-[--cell-size] h-6",
          "flex items-center justify-center",
          defaultClassNames.weekday
        ),
        week: cn(
          "flex w-full gap-0.5 mt-0.5",
          defaultClassNames.week
        ),
        week_number_header: cn(
          "w-[--cell-size] select-none text-gray-600 font-semibold text-xs",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-gray-500 select-none text-xs font-medium",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative flex-1 aspect-square select-none p-0 text-center",
          "max-w-[--cell-size] h-[--cell-size]",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-blue-500/10 backdrop-blur-sm",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "bg-blue-500/5 backdrop-blur-sm",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "bg-blue-500/10 backdrop-blur-sm",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-blue-50/80 backdrop-blur-sm text-blue-700 font-bold",
          "ring-2 ring-inset ring-blue-500/40",
          defaultClassNames.today
        ),
        outside: cn(
          "text-gray-400 aria-selected:text-gray-400 opacity-50",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-gray-300 opacity-40 cursor-not-allowed",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4 text-gray-700", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-gray-700", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 text-gray-700", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex items-center justify-center",
        "w-full h-full aspect-square",
        "font-medium text-gray-700 text-sm leading-none",
        "rounded-lg transition-all duration-200 ease-in-out",
        "p-0",
        
        "hover:bg-white/70 hover:backdrop-blur-md hover:shadow-md hover:scale-105",
        
        "data-[selected-single=true]:bg-blue-600 data-[selected-single=true]:text-white",
        "data-[selected-single=true]:shadow-lg data-[selected-single=true]:shadow-blue-500/30",
        "data-[selected-single=true]:font-bold data-[selected-single=true]:scale-105",
        "data-[selected-single=true]:hover:bg-blue-700",
        
        "data-[range-middle=true]:bg-blue-100/60 data-[range-middle=true]:backdrop-blur-sm",
        "data-[range-middle=true]:text-blue-900 data-[range-middle=true]:font-medium",
        
        "data-[range-start=true]:bg-blue-600 data-[range-start=true]:text-white",
        "data-[range-start=true]:shadow-lg data-[range-start=true]:shadow-blue-500/30",
        "data-[range-start=true]:font-bold data-[range-start=true]:rounded-lg",
        
        "data-[range-end=true]:bg-blue-600 data-[range-end=true]:text-white",
        "data-[range-end=true]:shadow-lg data-[range-end=true]:shadow-blue-500/30",
        "data-[range-end=true]:font-bold data-[range-end=true]:rounded-lg",
        
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
