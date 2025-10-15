import { Button } from "@/components/ui/button"
import { CopyPlus } from "lucide-react"
import * as React from "react"

interface AddIndicatorButtonProps {
  onClick?: () => void
}

export function AddIndicatorButton({ onClick }: AddIndicatorButtonProps) {
  return (
    <Button
      variant="outline"
      size="default"
      onClick={onClick}
      className="w-64 h-24 border-2 border-dashed border-gray-300 rounded-[5px] bg-gray-100/25 hover:bg-gray-100 hover:border-gray-400  text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <CopyPlus className="w-10 h-10" style={{ width: '25px', height: '25px' }} />
        </div>
        <span className="text-sm font-medium">Adicionar indicador</span>
      </div>
    </Button>
  )
}
