// Server component: fetch gerência by slug (or id fallback) and render interactive client page
import { notFound } from 'next/navigation';
import ClientGerenciaPage from './ClientPage';
import { getGerenciaBySlug, getGerenciaById, getDiretoriaById } from '@/services/organizacaoService';

export default async function GerenciaPage({ params }: { params: { id: string } }) {
    const raw = params.id;

    // Try slug first, then fallback to ID
    const gerencia = (await getGerenciaBySlug(raw)) || (await getGerenciaById(raw));
    if (!gerencia) {
        notFound();
    }

    const diretoria = gerencia?.diretoriaId ? await getDiretoriaById(gerencia.diretoriaId) : null;

    return (
        <ClientGerenciaPage
            gerencia={{ id: gerencia.id, nome: gerencia.nome, sigla: gerencia.sigla, descricao: gerencia.descricao, image: gerencia.image }}
            diretoria={{ id: diretoria?.id || '', nome: diretoria?.nome || 'Diretoria', corFrom: diretoria?.corFrom, corTo: diretoria?.corTo }}
        />
    );
}