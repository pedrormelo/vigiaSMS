import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react";

interface AddDashboardButtonProps {
    onClick?: () => void;
}

export function AddDashboardButton({ onClick }: AddDashboardButtonProps) {
    return (
        <Button
            onClick={onClick}
            className="w-10 h-10 cursor-pointer text-[#7C96FF] hover:text-white bg-gradient-to-b from-[#e4eaff] to-[#9fb2ff] hover:from-[#CDD7FF]/70 hover:to-[#486DFF]/75 border border-[#BFCCFF]/100 hover:border-[#9fb2ff] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
            <Plus strokeWidth={2.55} className="h-10 w-10" style={{ height: '20px', width: '20px' }} />
        </Button>
    );
}