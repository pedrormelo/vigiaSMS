import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LateBadge } from "@/components/alerts/lateBadge"
import { ScheduleAlert } from "@/components/alerts/bannerAlert"
import * as React from "react"
import { mapStatusToVariants, type ComponentItem } from "@/constants/alerts"

export default function AlertComponentsDemo() {
    // Mock data now; swap with backend fetch later
    const components: ComponentItem[] = [
        {
            id: 1,
            name: "Erro de usuário",
            dueDate: "2024-01-15",
            status: "erro",
            daysLate: 5,
        },
        {
            id: 2,
            name: "Atraso na atualização de arquivo",
            dueDate: "2024-01-20",
            status: "atraso",
            daysLate: 2,
        },
        {
            id: 3,
            name: "Mudanças na dashboard principal",
            dueDate: "2024-01-25",
            status: "atualizacao",
            daysLate: 0,
        },
    ]

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-6">

            <div className="container mx-auto px-4 py-8">
                {/* Usage Examples */}
                <div className="mt-12 space-y-6">
                    <h3 className="text-2xl font-bold">Component Usage Examples</h3>

                    <Card>
                        <CardHeader>
                            <CardTitle>Late Badge Examples</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium w-20">Atraso:</span>
                                <LateBadge daysLate={2} variant="atraso" />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium w-20">Erro:</span>
                                <LateBadge daysLate={5} variant="erro" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mock data wired to variants</CardTitle>
                            <CardDescription>
                                Este bloco usa mapStatusToVariants para ligar o status do backend aos componentes visuais.
                                {/* TODO: substituir por busca real do backend quando disponível */}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {components.map((c) => {
                                const m = mapStatusToVariants(c.status);
                                return (
                                    <div key={c.id} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">{c.name}</span>
                                            {m.badge && <LateBadge daysLate={c.daysLate} variant={m.badge} />}
                                        </div>
                                        {m.schedule && (
                                            <ScheduleAlert
                                                daysLate={c.daysLate}
                                                variant={m.schedule}
                                                title={c.name}
                                                description={`Previsto para ${c.dueDate}.`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
