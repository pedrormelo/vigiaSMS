// components/ui/stats-card.tsx
interface StatsCardProps {
    value: number;
    label: string;
    color: "blue" | "green" | "purple" | "orange";
    icon: React.ReactNode;
}

export function StatsCard({ value, label, color, icon }: StatsCardProps) {
    const colors = {
        blue: "bg-blue-50 text-blue-700",
        green: "bg-green-50 text-green-700", 
        purple: "bg-purple-50 text-purple-700",
        orange: "bg-orange-50 text-orange-700"
    };

    return (
        <div className={`rounded-2xl p-4 text-center ${colors[color]}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
                {icon}
                <div className="text-2xl font-bold">{value}</div>
            </div>
            <div className="text-sm opacity-80">{label}</div>
        </div>
    );
}