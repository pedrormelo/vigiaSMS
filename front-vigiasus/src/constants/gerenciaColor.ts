// src/utils/gerenciaColor.ts

import { gerenciasHierarquia } from '@/constants/gerenciaData';

const shadeColor = (color: string, percent: number): string => {
    const f = parseInt(color.slice(1), 16)
    const t = percent < 0 ? 0 : 255
    const p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = (f >> 8) & 0x00ff,
        B = f & 0x0000ff;
    return (
        "#" +
        (
            0x1000000 +
            (Math.round((t - R) * p) + R) * 0x10000 +
            (Math.round((t - G) * p) + G) * 0x100 +
            (Math.round((t - B) * p) + B)
        )
            .toString(16)
            .slice(1)
    );
};

export const getGerenciaColor = (gerenciaName: string): string => {
    for (const diretoria of gerenciasHierarquia) {
        const gerenciaIndex = diretoria.gerencias.findIndex(g => g.name === gerenciaName);
        if (gerenciaIndex !== -1) {
            const shade = gerenciaIndex * 0.099; 
            return shadeColor(diretoria.color, shade);
        }
    }
    return "#9CA3AF";
};