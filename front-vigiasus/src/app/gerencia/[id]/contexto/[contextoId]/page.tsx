"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function VisualizarContextoPage() {
    const params = useParams();
    const router = useRouter();
    const contextoId = useMemo(() => (params?.contextoId as string) || "", [params?.contextoId]);
    const slug = useMemo(() => (params?.slug as string) || (params?.id as string) || "", [params?.slug, params?.id]);
    const user = useCurrentUser();

    const aoFechar = () => {
        if (slug) {
            router.push(`/gerencia/${slug}`);
            return;
        }
        router.back();
    };

    if (!contextoId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-700">
                    Contexto não encontrado.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FDFDFD] min-h-screen">
            <VisualizarContextoModal
                estaAberto
                modoPagina
                aoFechar={aoFechar}
                dadosDoContexto={{ id: contextoId } as any}
                perfil={user?.role}
                usuarioGerenciaId={user?.gerenciaId}
                currentUserId={user?.id}
            />
        </div>
    );
}
