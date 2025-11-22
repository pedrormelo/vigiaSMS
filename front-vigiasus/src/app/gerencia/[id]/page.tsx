// src/app/gerencia/[slug]/page.tsx
"use client";

import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { SearchX, UploadCloud, Loader2 } from 'lucide-react';

// Hooks
import { useDebounce } from "@/hooks/useDebounce";
import { useStaleness } from "@/hooks/useStaleness";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Componentes
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";
import GerenciaDashboardPreview from "@/components/gerencia/dashboard/gerencia-dashboard-preview";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal/index";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";
import StatusBadge from "@/components/alerts/statusBadge";
import StatusBanner from "@/components/ui/status-banner";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
// [REMOVIDO] OcultarContextoModal (agora vive dentro do card)


import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, SubmitData } from "@/components/popups/addContextoModal/types";
import { Contexto, StatusContexto } from "@/components/validar/typesDados";

import { getContextosPorGerencia, criarContexto, CriarContextoData } from "@/services/contextoService";
import { getGerenciaBySlug, Gerencia } from "@/services/organizacaoService";
import { mapTipoGraficoParaBackend, normalizarNumero } from "@/lib/gerenciaUtils";
import IndicadoresSection from "@/components/gerencia/sections/IndicadoresSection";

export default function GerenciaPage() {
    const params = useParams();
    const slug = (params?.slug as string) || (params?.id as string) || "";
    const [gerenciaData, setGerenciaData] = useState<Gerencia | null>(null);

    const user = useCurrentUser();
    const perfil = (user?.role?.toLowerCase() as "diretor" | "gerente" | "membro") || "membro";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [abaInicial, setAbaInicial] = useState<AbaAtiva>('contexto');
    const [modo, setModo] = useState<'visualizacao' | 'edicao'>('visualizacao');
    const [dadosParaEditar, setDadosParaEditar] = useState<Partial<DetalhesContexto> | null>(null);
    const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
    const [ficheiroSelecionado, setFicheiroSelecionado] = useState<DetalhesContexto | null>(null);

    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState<'recente' | 'todas'>("todas");
    const [selectedTypes, setSelectedTypes] = useState<FileType[]>([]);
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const [isDragging, setIsDragging] = useState(false);
    const [arquivoAnexadoPorDrop, setArquivoAnexadoPorDrop] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [todosOsContextos, setTodosOsContextos] = useState<Contexto[]>([]);

    // [REMOVIDO] Estados do modal de ocultar (não são mais necessários aqui)

    const carregarDados = useCallback(async () => {
        if (!slug) return;
        try {
            setError(null);
            const gerenciaEncontrada = await getGerenciaBySlug(slug);
            if (!gerenciaEncontrada) throw new Error("Gerência não encontrada.");
            setGerenciaData(gerenciaEncontrada);
            const contextos = await getContextosPorGerencia(gerenciaEncontrada.id);
            setTodosOsContextos(contextos);
        } catch (err: any) {
            console.error("Erro ao buscar dados:", err);
            setError(err.message || "Não foi possível carregar os dados.");
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Força o modo conforme a regra de negócio
    useEffect(() => {
        if (!gerenciaData) return;
        const canEdit = user?.role === 'membro' && user?.gerenciaId === gerenciaData.id;
        setModo(canEdit ? 'edicao' : 'visualizacao');
    }, [user, gerenciaData]);

    // --- LÓGICA DE ENVIO AO BACKEND ---

    const aoSubmeterConteudo = async (dados: SubmitData) => {
        let payload: CriarContextoData | null = null;
        let arquivo: File | null = null;

        try {
            if (dados.type === 'contexto') {
                const titulo = dados.payload.title?.trim();
                const descricao = dados.payload.details?.trim();
                const linkUrl = dados.payload.url?.trim();
                const file = dados.payload.file ?? null;

                if (!titulo) {
                    showErrorToast('Título obrigatório', 'Informe um título para o contexto.');
                    return;
                }

                if (!linkUrl && !file) {
                    showErrorToast('Fonte obrigatória', 'Selecione um arquivo ou informe um link válido.');
                    return;
                }

                payload = {
                    tituloConceitual: titulo,
                    tipo: 'ARQUIVO_LINK',
                    titulo,
                    descricao: descricao || undefined,
                };

                if (linkUrl) {
                    payload.linkUrl = linkUrl;
                }

                arquivo = file;
            } else if (dados.type === 'dashboard') {
                const titulo = dados.payload.title?.trim();
                const descricao = dados.payload.details?.trim();
                const tipoGrafico = mapTipoGraficoParaBackend(dados.payload.type);
                const dataset = dados.payload.dataset
                    ? JSON.parse(JSON.stringify(dados.payload.dataset)) as Record<string, unknown>
                    : undefined;

                if (!titulo) {
                    showErrorToast('Título obrigatório', 'Informe um título para o dashboard.');
                    return;
                }

                if (!tipoGrafico || !dataset) {
                    showErrorToast('Dados incompletos', 'Defina o tipo de gráfico e os dados do dashboard.');
                    return;
                }

                payload = {
                    tituloConceitual: titulo,
                    tipo: 'DASHBOARD',
                    titulo,
                    descricao: descricao || undefined,
                    tipoGrafico,
                    dashboardPayload: dataset,
                };
            } else if (dados.type === 'indicador') {
                const titulo = dados.payload.titulo?.trim();
                const descricao = dados.payload.descricao?.trim();
                const valorAtual = normalizarNumero(dados.payload.valorAtual);
                const valorAlvo = normalizarNumero(dados.payload.valorAlvo);
                const unidade = dados.payload.unidade?.trim();
                const textoComparativo = dados.payload.textoComparativo?.trim();
                const cor = dados.payload.cor;
                const icone = dados.payload.icone;

                if (!titulo) {
                    showErrorToast('Título obrigatório', 'Informe um título para o indicador.');
                    return;
                }

                if (valorAtual === undefined) {
                    showErrorToast('Valor atual obrigatório', 'Informe o valor atual do indicador (apenas números).');
                    return;
                }

                payload = {
                    tituloConceitual: titulo,
                    tipo: 'INDICADOR',
                    titulo,
                    descricao: descricao || undefined,
                    valorAtual,
                    valorAlvo: valorAlvo !== undefined ? valorAlvo : undefined,
                    unidade: unidade && unidade !== 'Nenhum' ? unidade : undefined,
                    textoComparativo: textoComparativo || undefined,
                    cor,
                    icone,
                };
            }

            if (!payload) {
                return;
            }

            await criarContexto(payload, arquivo);

            showSuccessToast('Contexto enviado com sucesso! Aguardando aprovação.');
            fecharModalAdicionar();
            carregarDados();
        } catch (err: any) {
            console.error('Erro ao criar contexto:', err);
            showErrorToast(err?.message || 'Erro ao enviar contexto.');
        }
    };

    const stalenessExtractors = useMemo(() => [
        () => {
            const arr: Array<string> = [];
            for (const f of todosOsContextos) {
                if (f.status === StatusContexto.Publicado) {
                    if (f.insertedDate) arr.push(f.insertedDate);
                    if (Array.isArray(f.versoes)) {
                        for (const v of f.versoes) {
                            if (v.data && !v.estaOculta && v.status === StatusContexto.Publicado) {
                                arr.push(v.data);
                            }
                        }
                    }
                }
            }
            return arr;
        },
    ], [todosOsContextos]);

    const { variant: stalenessVariant, label: stalenessLabel } = useStaleness({
        extractors: stalenessExtractors,
        thresholds: { recentDays: 7, staleDays: 30 },
        locale: 'pt-BR'
    });

    const handleSelectedTypesChange = (type: FileType) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const filteredIndicators = useMemo(() => {
        return todosOsContextos.filter(ctx => {
            if (ctx.type !== 'indicador') return false;
            const matchesSearch = ctx.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            const matchesStatus = modo === 'edicao' || ctx.status === StatusContexto.Publicado;
            const matchesVisibility = (modo === 'edicao') || !ctx.estaOculto;
            return matchesStatus && matchesVisibility && matchesSearch;
        });
    }, [todosOsContextos, debouncedSearchValue, modo]);

    const filteredDashboards = useMemo(() => {
        return todosOsContextos.filter(ctx => {
            if (ctx.type !== 'dashboard') return false;
            const matchesSearch = ctx.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            const matchesStatus = ctx.status === StatusContexto.Publicado;
            const matchesVisibility = (modo === 'edicao') || !ctx.estaOculto;
            return matchesStatus && matchesVisibility && matchesSearch;
        });
    }, [todosOsContextos, debouncedSearchValue, modo]);

    const filteredFiles = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return todosOsContextos.filter(file => {
            if (file.type === 'indicador') return false;

            const matchesSearch = file.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            const matchesTab = activeTab === 'todas' || new Date(file.insertedDate) >= sevenDaysAgo;
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
            const matchesStatus = (modo === 'edicao') || file.status === StatusContexto.Publicado;
            const matchesVisibility = (modo === 'edicao') || !file.estaOculto;

            return matchesStatus && matchesVisibility && matchesSearch && matchesTab && matchesType;
        });
    }, [debouncedSearchValue, activeTab, selectedTypes, todosOsContextos, modo]);

    const abrirModal = (aba: AbaAtiva) => {
        setAbaInicial(aba);
        setIsModalOpen(true);
    };

    const fecharModalAdicionar = () => {
        setIsModalOpen(false);
        setDadosParaEditar(null);
        setArquivoAnexadoPorDrop(null);
    };

    const handleCloseViewModal = () => {
        setModalVisualizacaoAberto(false);
        setFicheiroSelecionado(null);
    };

    const lidarComCriarNovaVersao = (dadosDoContextoAntigo: DetalhesContexto) => {
        setDadosParaEditar(dadosDoContextoAntigo);
        setModalVisualizacaoAberto(false);
        const tabParaAbrir: AbaAtiva =
            dadosDoContextoAntigo.type === 'dashboard' ? 'dashboard' :
                dadosDoContextoAntigo.type === 'indicador' ? 'indicador' :
                    'contexto';
        setTimeout(() => abrirModal(tabParaAbrir), 50);
    };

    const lidarComVisualizarIndicador = (indicator: Contexto) => {
        setFicheiroSelecionado(indicator);
        setModalVisualizacaoAberto(true);
    };

    const aoClicarArquivo = (ficheiro: Contexto) => {
        setFicheiroSelecionado(ficheiro);
        setModalVisualizacaoAberto(true);
    };

    // [CORREÇÃO CRÍTICA] Handler Simplificado
    // O ContextoCard já chamou o backend. Aqui nós apenas atualizamos o estado local
    // para refletir a mudança imediatamente e fazer a etiqueta (badge) aparecer.
    const lidarComAlternarVisibilidadeContexto = (contextoId: string) => {
        setTodosOsContextos(prev =>
            prev.map(ctx =>
                // Inverte o valor atual para refletir o que aconteceu no backend
                ctx.id === contextoId ? { ...ctx, estaOculto: !ctx.estaOculto } : ctx
            )
        );
        // Opcional: Se quiser garantir sincronia absoluta com o servidor, descomente a linha abaixo:
        // carregarDados();
    };

    // [REMOVIDO] handleConfirmarOcultar e handleCancelarOcultar (Lógica movida para o Card)

    const lidarComAlternarVisibilidadeVersao = (contextoId: string, versaoId: number) => {
        setTodosOsContextos(prev => prev.map(ctx => {
            if (ctx.id === contextoId && ctx.versoes) {
                return {
                    ...ctx,
                    versoes: ctx.versoes.map(v => v.id === versaoId ? { ...v, estaOculta: !v.estaOculta } : v)
                };
            }
            return ctx;
        }));
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (modo === 'edicao') { setIsDragging(true); } }, [modo]);
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) { return; } setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        if (modo !== 'edicao') { return; }
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setArquivoAnexadoPorDrop(e.dataTransfer.files[0]);
            setAbaInicial('contexto');
            setIsModalOpen(true);
            e.dataTransfer.clearData();
        }
    }, [modo]);

    if (!slug) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

    if (error && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500 p-8">
                <SearchX className="w-12 h-12" />
                <p className="mt-4 text-lg font-semibold">Erro ao carregar dados</p>
                <p className="text-sm text-center">{error}</p>
            </div>
        );
    }

    if (isLoading || !gerenciaData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="mt-4 text-lg font-medium">A carregar dados da gerência...</p>
            </div>
        );
    }

    const { diretoria } = gerenciaData;

    const renderContent = () => {
        return (
            <>
                <IndicadoresSection
                    indicadores={filteredIndicators}
                    modo={modo}
                    onAddIndicator={() => abrirModal('indicador')}
                    onClickIndicator={lidarComVisualizarIndicador}
                />
                <div className="mb-3">
                    <StatusBadge variant={stalenessVariant} label={stalenessLabel} />
                </div>

                <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} activeTab={activeTab} onTabChange={setActiveTab} selectedTypes={selectedTypes} onSelectedTypesChange={handleSelectedTypesChange} clearTypeFilter={() => setSelectedTypes([])} />

                <div className="border-2 border-none border-gray-300 rounded-4xl bg-[#FDFDFD] min-h-[300px] flex items-center justify-center">
                    {filteredFiles.length > 0 || (modo === 'edicao') ? (
                        <FileGrid
                            files={filteredFiles}
                            onFileClick={aoClicarArquivo}
                            isEditing={modo === 'edicao'}
                            onAddContextClick={() => abrirModal('contexto')}
                            onToggleOculto={lidarComAlternarVisibilidadeContexto}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <SearchX className="w-16 h-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Nenhum Contexto Encontrado</h3>
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <div
            className="min-h-screen bg-[#FDFDFD] relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <ModalAdicionarConteudo
                estaAberto={isModalOpen}
                aoFechar={fecharModalAdicionar}
                aoSubmeter={aoSubmeterConteudo}
                abaInicial={abaInicial}
                dadosIniciais={dadosParaEditar}
                arquivoAnexado={arquivoAnexadoPorDrop}
            />
            <VisualizarContextoModal
                estaAberto={modalVisualizacaoAberto}
                aoFechar={handleCloseViewModal}
                dadosDoContexto={ficheiroSelecionado}
                aoCriarNovaVersao={lidarComCriarNovaVersao}
                perfil={perfil}
                isEditing={modo === 'edicao'}
                aoAlternarVisibilidadeVersao={lidarComAlternarVisibilidadeVersao}
                aoAlternarVisibilidadeIndicador={lidarComAlternarVisibilidadeContexto}
                usuarioGerenciaId={user?.gerenciaId}
            />

            {/* [REMOVIDO] O modal OcultarContextoModal não é renderizado aqui para evitar duplicação */}

            <div className="relative p-8 mb-6 text-white shadow-lg"
                style={{
                    background: diretoria?.bannerImage
                        ? `url(${diretoria.bannerImage}) center/cover`
                        : `linear-gradient(to right, ${diretoria?.corFrom || '#ccc'}, ${diretoria?.corTo || '#999'})`
                }}>
                <h2 className="text-3xl font-regular mt-1">{diretoria?.nome || "Diretoria"}</h2>
            </div>

            <div className="container mx-auto p-6">

                {(stalenessVariant === 'stale' || stalenessVariant === 'error') && !isLoading && (
                    <div className="mb-6">
                        <StatusBanner
                            variant={stalenessVariant === 'stale' ? 'warning' : 'danger'}
                            title={stalenessVariant === 'stale' ? 'Esta gerência está sem atualizações recentes.' : 'Esta gerência parece inativa.'}
                        >
                            <p className="pl-9 text-sm">Atualize o conteúdo para regularizar.</p>
                        </StatusBanner>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-6xl font-bold text-blue-700">{gerenciaData.sigla}</h1>
                        <h2 className="text-4xl ml-2.5 text-blue-600 uppercase">{gerenciaData.nome}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => abrirModal('dashboard')} />}
                </div>
                <div className="mb-10">
                    <GerenciaDashboardPreview
                        graphs={filteredDashboards}
                        gerencia={gerenciaData.id}
                        disabled={user?.role === 'membro' && modo !== 'edicao'}
                    />
                </div>

                {renderContent()}

                <div className="mt-32 mb-16">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                        <div className="flex-1">
                            <div className="flex gap-4 items-center mb-4">
                                <h1 className="text-6xl font-extrabold text-blue-700">{gerenciaData.sigla}</h1>
                                <h3 className="text-4xl font-regular text-blue-600">{gerenciaData.nome}</h3>
                            </div>
                            <span className="text-2xl font-medium ml-2 text-blue-600">SOBRE</span>
                            <div className="mb-8 mt-3 max-w-full lg:max-w-[90%]">
                                <p className="text-md ml-2 text-blue-600">{gerenciaData.descricao ?? "Sem descrição disponível."}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 relative w-full lg:w-[300px] h-[240px] lg:h-[340px] rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-md">
                            {gerenciaData.image ? <Image src={gerenciaData.image} alt={gerenciaData.nome} fill className="object-cover" /> : <span className="text-gray-400 text-lg">Sem imagem</span>}
                        </div>
                    </div>
                </div>
            </div>

            {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-none">
                    <UploadCloud className="w-32 h-32 text-white/90 animate-pulse" />
                    <p className="mt-4 text-3xl font-bold text-white">Solte para adicionar</p>
                </div>
            )}
        </div>
    );
}