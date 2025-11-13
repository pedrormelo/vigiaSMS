"use client"

import { MetricsGrid, type MetricItem } from "./metricsGrid"
import { Activity, Building2, Syringe, Users, Calendar } from "lucide-react"

export interface SecretariaMetricsSectionProps {
    mainTitle?: string
    secondaryTitle?: string
    mainItems?: MetricItem[]
    secondaryItems?: MetricItem[]
    loading?: boolean
}

export function SecretariaMetricsSection({
    mainTitle = "Métricas das Diretorias",
    secondaryTitle = "Outras Métricas",
    mainItems,
    secondaryItems,
    loading = false,
}: SecretariaMetricsSectionProps) {
    // Default mock data (can be replaced with API data via props)
    const defaultMain: MetricItem[] = [
        { title: "Unidades com PEC", value: "87%", icon: Building2, color: "blue", goal: "92%", progress: 87 },
        { title: "Unidades com PEC", value: "62%", icon: Building2, color: "cyan", goal: "92%", progress: 62 },
        { title: "Média de Vacinação", value: "59%", icon: Syringe, color: "green", goal: "92%", progress: 59 },
        { title: "Procedimentos/Mês", value: "3 mil", icon: Activity, color: "orange", goal: "4 mil", progress: 75 },
        { title: "Tempo Médio de Espera", value: "20 dias", icon: Calendar, color: "red", goal: "15 dias", progress: 45 },
    ]

    const defaultSecondary: MetricItem[] = [
        { title: "Total de Pacientes", value: "15.234", icon: Users, color: "purple" },
        { title: "Taxa de Atendimento", value: "94%", icon: Activity, color: "green", goal: "90%", progress: 94 },
        { title: "Tempo Médio de Espera", value: "12 min", icon: Calendar, color: "orange", goal: "15 min", progress: 80 },
    ]

    const main = mainItems ?? defaultMain
    const secondary = secondaryItems ?? defaultSecondary

    return (
        <div>
            <MetricsGrid
                title={mainTitle}
                items={main}
                loading={loading}
                columns={5}
            />

            <MetricsGrid
                className="mt-12"
                title={secondaryTitle}
                items={secondary}
                loading={loading}
                columns={3}
            />
        </div>
    )
}
