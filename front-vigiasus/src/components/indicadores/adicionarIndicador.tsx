import { Button } from "@/components/ui/button"

import { CopyPlus } from "lucide-react";

export function AddIndicatorButton() {
    return (
        <Button
            variant="outline"
            className="w-64 h-24 cursor-pointer border-2 rounded-[5px] border-dashed border-gray-300  bg-gray-100/25 hover:bg-gray-100 hover:border-gray-400 transition-colors"
        >
            <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600">
                <div className="flex items-center gap-2">
                    <CopyPlus className="w-10 h-10" style={{ height: '25px', width: '25px' }} />
                </div>
                <span className="text-sm font-medium">Adicionar indicador</span>
            </div>
        </Button>
    )
}
