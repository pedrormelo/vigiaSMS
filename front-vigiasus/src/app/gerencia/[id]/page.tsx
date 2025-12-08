// src/app/gerencia/[slug]/page.tsx
"use client";

import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { SearchX, UploadCloud } from 'lucide-react';

// Hooks
import { useDebounce } from "@/hooks/useDebounce";
import { useStaleness } from "@/hooks/useStaleness";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Componentes
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import { ViewToggle, ViewMode } from "@/components/contextosCard/viewToggle";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";
import GerenciaDashboardPreview from "@/components/gerencia/dashboard/gerencia-dashboard-preview";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal/index";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";
import StatusBadge from "@/components/alerts/statusBadge";
import StatusBanner from "@/components/ui/status-banner";
import GlobalLoading from "@/components/ui/global-loading";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
// [REMOVIDO] OcultarContextoModal (agora vive dentro do card)


import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, SubmitData, VersionInfo } from "@/components/popups/addContextoModal/types";
import { Contexto, StatusContexto } from "@/components/validar/typesDados";

import { getContextosPorGerencia, criarContexto, criarVersao, CriarContextoData } from "@/services/contextoService";
import { getGerenciaBySlug, Gerencia } from "@/services/organizacaoService";
import { mapTipoGraficoParaBackend, normalizarNumero } from "@/lib/gerenciaUtils";
import IndicadoresSection from "@/components/gerencia/sections/IndicadoresSection";
import { getDiretoriaDashboardKpis, getDiretoriaDashboardLayout } from "@/services/dashboardService";

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
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [dashboardsOcultosGerencia, setDashboardsOcultosGerencia] = useState<string[]>([]);
    const [contextosBloqueadosOcultar, setContextosBloqueadosOcultar] = useState<Record<string, string>>({});

    // [REMOVIDO] Estados do modal de ocultar (não são mais necessários aqui)

    const dashboardsHiddenStorageKey = gerenciaData?.id
        ? `vigiasus:gerencia-dashboard-hidden:${gerenciaData.id}`
        : null;

    useEffect(() => {
        if (!dashboardsHiddenStorageKey) {
            setDashboardsOcultosGerencia([]);
            return;
        }

        try {
            const saved = typeof window !== 'undefined' ? window.localStorage.getItem(dashboardsHiddenStorageKey) : null;
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setDashboardsOcultosGerencia(parsed.filter((id: unknown): id is string => typeof id === 'string'));
                } else {
                    setDashboardsOcultosGerencia([]);
                }
            } else {
                setDashboardsOcultosGerencia([]);
            }
        } catch (error) {
            console.warn('Não foi possível carregar preferências locais de dashboards ocultos:', error);
            setDashboardsOcultosGerencia([]);
        }
    }, [dashboardsHiddenStorageKey]);

    useEffect(() => {
        if (!dashboardsHiddenStorageKey) return;
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(dashboardsHiddenStorageKey, JSON.stringify(dashboardsOcultosGerencia));
            }
        } catch (error) {
            console.warn('Não foi possível salvar preferências locais de dashboards ocultos:', error);
        }
    }, [dashboardsOcultosGerencia, dashboardsHiddenStorageKey]);

    useEffect(() => {
        if (dashboardsOcultosGerencia.length === 0) return;
        setDashboardsOcultosGerencia(prev => {
            const validIds = new Set(todosOsContextos.map(ctx => ctx.id));
            const filtered = prev.filter(id => validIds.has(id));
            return filtered.length === prev.length ? prev : filtered;
        });
    }, [todosOsContextos]);

    const carregarDados = useCallback(async () => {
        if (!slug) return;
        try {
            setError(null);
            setIsLoading(true);
            const gerenciaEncontrada = await getGerenciaBySlug(slug);
            if (!gerenciaEncontrada) throw new Error("Gerência não encontrada.");
            setGerenciaData(gerenciaEncontrada);

            const [contextos, layout, kpis] = await Promise.all([
                getContextosPorGerencia(gerenciaEncontrada.id),
                gerenciaEncontrada.diretoriaId
                    ? getDiretoriaDashboardLayout(gerenciaEncontrada.diretoriaId).catch(() => null)
                    : Promise.resolve(null),
                gerenciaEncontrada.diretoriaId
                    ? getDiretoriaDashboardKpis(gerenciaEncontrada.diretoriaId).catch(() => [])
                    : Promise.resolve([])
            ]);

            const versoesEmUso = new Set<string>();
            layout?.items?.forEach(item => {
                if (item?.contextoVersaoId) {
                    versoesEmUso.add(item.contextoVersaoId);
                }
            });
            kpis?.forEach(item => {
                if (item?.contextoVersaoId) {
                    versoesEmUso.add(item.contextoVersaoId);
                }
            });

            if (versoesEmUso.size > 0) {
                const reasonBase = gerenciaEncontrada.diretoria?.nome
                    ? `Este conteúdo está em uso no dashboard da diretoria ${gerenciaEncontrada.diretoria.nome}.`
                    : 'Este conteúdo está em uso em um dashboard de diretoria.';
                const bloqueados: Record<string, string> = {};
                contextos.forEach(ctx => {
                    const versoes = ctx.versoes || [];
                    const emUso = versoes.some(v => v.dbId && versoesEmUso.has(v.dbId));
                    if (emUso) {
                        bloqueados[ctx.id] = reasonBase;
                    }
                });
                setContextosBloqueadosOcultar(bloqueados);
            } else {
                setContextosBloqueadosOcultar({});
            }

            setTodosOsContextos(contextos);
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            const errorMessage = err instanceof Error ? err.message : "Não foi possível carregar os dados.";
            setError(errorMessage);
            setContextosBloqueadosOcultar({});
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

        const versionInfo = (dados.payload as { versionInfo?: VersionInfo | null })?.versionInfo ?? null;
        const isNovaVersao = Boolean(versionInfo && dadosParaEditar?.id);

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

                const baseTituloConceitual = isNovaVersao && dadosParaEditar?.title
                    ? dadosParaEditar.title
                    : titulo;

                payload = {
                    tituloConceitual: baseTituloConceitual,
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

                const baseTituloConceitual = isNovaVersao && dadosParaEditar?.title
                    ? dadosParaEditar.title
                    : titulo;

                payload = {
                    tituloConceitual: baseTituloConceitual,
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

                const baseTituloConceitual = isNovaVersao && dadosParaEditar?.title
                    ? dadosParaEditar.title
                    : titulo;

                payload = {
                    tituloConceitual: baseTituloConceitual,
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

            let successMessage = 'Contexto enviado com sucesso! Aguardando aprovação.';

            if (isNovaVersao && dadosParaEditar?.id) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { tituloConceitual, ...rest } = payload; // tituloConceitual removed from versaoPayload
                const versaoPayload: CriarContextoData = {
                    ...rest,
                    motivoNovaVersao: versionInfo?.type,
                    descNovaVersao: versionInfo?.description,
                };

                await criarVersao(dadosParaEditar.id, versaoPayload, arquivo);
                successMessage = 'Nova versão enviada! Aguardando aprovação.';
            } else {
                await criarContexto(payload, arquivo);
            }

            showSuccessToast(successMessage);
            fecharModalAdicionar();
            await carregarDados();
        } catch (err) {
            console.error(isNovaVersao ? 'Erro ao criar nova versão:' : 'Erro ao criar contexto:', err);
            const errorMessage = err instanceof Error ? err.message : (isNovaVersao ? 'Erro ao enviar nova versão.' : 'Erro ao enviar contexto.');
            showErrorToast(errorMessage);
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

    const canSeePending = modo === 'edicao' || perfil === 'gerente';

    const filteredIndicators = useMemo(() => {
        return todosOsContextos.filter(ctx => {
            if (ctx.type !== 'indicador') return false;
            const matchesSearch = ctx.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            
            // No modo visualização, apenas publicados; no modo edição, todos (inclusive indeferidos)
            const matchesStatus = canSeePending ? true : ctx.status === StatusContexto.Publicado;
            
            const matchesVisibility = (modo === 'edicao') || !ctx.estaOculto;
            return matchesStatus && matchesVisibility && matchesSearch;
        });
    }, [todosOsContextos, debouncedSearchValue, modo, canSeePending]);

    const filteredDashboards = useMemo(() => {
        return todosOsContextos.filter(ctx => {
            if (ctx.type !== 'dashboard') return false;
            const matchesSearch = ctx.title.toLowerCase().includes(debouncedSearchValue.toLowerCase());
            
            // Dashboards: apenas publicados são exibidos (mesmo no modo edição)
            // Indeferidos não devem aparecer aqui para evitar confusão
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
            
            // No modo visualização, apenas publicados; no modo edição, todos (inclusive indeferidos)
            const matchesStatus = canSeePending ? true : file.status === StatusContexto.Publicado;
            
            const matchesVisibility = (modo === 'edicao') || !file.estaOculto;

            return matchesStatus && matchesVisibility && matchesSearch && matchesTab && matchesType;
        });
    }, [debouncedSearchValue, activeTab, selectedTypes, todosOsContextos, modo, canSeePending]);

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
        setFicheiroSelecionado(prev =>
            prev && prev.id === contextoId ? { ...prev, estaOculto: !prev.estaOculto } : prev
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

    const ocultarGraficoNoPainel = useCallback((contextoId: string) => {
        setDashboardsOcultosGerencia(prev => prev.includes(contextoId) ? prev : [...prev, contextoId]);
    }, []);

    const reexibirGraficoNoPainel = useCallback((contextoId: string) => {
        setDashboardsOcultosGerencia(prev => prev.filter(id => id !== contextoId));
    }, []);

    const reexibirTodosGraficosNoPainel = useCallback(() => {
        setDashboardsOcultosGerencia([]);
    }, []);

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

    if (!slug) return <GlobalLoading />;

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
        return <GlobalLoading message="Carregando dados da gerência..." subMessage="Estamos buscando arquivos, indicadores e dashboards cadastrados." />;
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

                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <FilterBar
                            searchValue={searchValue}
                            onSearchChange={setSearchValue}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            selectedTypes={selectedTypes}
                            onSelectedTypesChange={handleSelectedTypesChange}
                            clearTypeFilter={() => setSelectedTypes([])}
                            tourId="tour-gerencia-filter"
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />
                    </div>
                    {/* <ViewToggle value={viewMode} onValueChange={setViewMode} /> */}
                </div>

                <div className="border-2 border-none border-gray-300 rounded-2xl md:rounded-4xl bg-[#FDFDFD] min-h-[300px] flex items-center justify-center" id="tour-gerencia-grid">
                    {filteredFiles.length > 0 || (modo === 'edicao') ? (
                        <FileGrid
                            files={filteredFiles}
                            onFileClick={aoClicarArquivo}
                            isEditing={modo === 'edicao'}
                            onAddContextClick={() => abrirModal('contexto')}
                            onToggleOculto={lidarComAlternarVisibilidadeContexto}
                            viewMode={viewMode}
                            ocultarBloqueadoMap={contextosBloqueadosOcultar}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4 md:p-6">
                            <SearchX className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mb-4" />
                            <h3 className="text-base md:text-xl font-semibold text-gray-700">Nenhum Contexto Encontrado</h3>
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
                    ocultarBloqueadoMap={contextosBloqueadosOcultar}
            />

            {/* [REMOVIDO] O modal OcultarContextoModal não é renderizado aqui para evitar duplicação */}

            <div className="relative p-4 md:p-8 mb-6 text-white shadow-lg"
                style={{
                    background: diretoria?.bannerImage
                        ? `url(${diretoria.bannerImage}) center/cover`
                        : `linear-gradient(to right, ${diretoria?.corFrom || '#ccc'}, ${diretoria?.corTo || '#999'})`
                }}>
                <h2 className="text-lg md:text-3xl font-regular mt-1">{diretoria?.nome || "Diretoria"}</h2>
            </div>

            <div className="container mx-auto p-4 md:p-6">

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

                <div className="flex flex-col gap-2 md:gap-4 mb-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-blue-700">{gerenciaData.sigla}</h1>
                        <h2 className="text-lg md:text-2xl lg:text-4xl text-blue-600 uppercase">{gerenciaData.nome}</h2>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-2 md:gap-4 mb-7 flex-wrap">
                    <h1 className="text-lg md:text-3xl text-blue-600">Dashboard</h1>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => abrirModal('dashboard')} />}
                </div>
                <div className="mb-10">
                    <GerenciaDashboardPreview
                        graphs={filteredDashboards}
                        gerencia={gerenciaData.id}
                        disabled={user?.role === 'membro' && modo !== 'edicao'}
                        canEdit={modo === 'edicao'}
                        hiddenGraphIds={dashboardsOcultosGerencia}
                        onHideGraph={ocultarGraficoNoPainel}
                        onRestoreGraph={reexibirGraficoNoPainel}
                        onRestoreAllGraphs={reexibirTodosGraficosNoPainel}
                    />
                </div>

                {renderContent()}

                <div className="mt-12 sm:mt-16 md:mt-32 mb-6 sm:mb-8 md:mb-16">
                    <div className="flex flex-col lg:flex-row items-start gap-4 md:gap-8">
                        <div className="flex-1">
                            <div className="flex flex-col gap-2 md:gap-4 items-start mb-4">
                                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-blue-700">{gerenciaData.sigla}</h1>
                                <h3 className="text-base sm:text-lg md:text-2xl lg:text-4xl font-regular text-blue-600">{gerenciaData.nome}</h3>
                            </div>
                            <span className="text-base sm:text-lg md:text-2xl font-medium ml-0 md:ml-2 text-blue-600 block mb-2 sm:mb-3 md:mb-0">SOBRE</span>
                            <div className="mb-6 sm:mb-8 mt-2 md:mt-3 max-w-full lg:max-w-[90%]">
                                <p className="text-xs sm:text-sm md:text-base ml-0 md:ml-2 text-blue-600">{gerenciaData.descricao ?? "Sem descrição disponível."}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 relative w-full sm:w-72 md:w-96 lg:w-[300px] h-[180px] sm:h-[240px] md:h-[320px] lg:h-[340px] rounded-lg md:rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-md">
                            {gerenciaData.image ? <Image src={gerenciaData.image} alt={gerenciaData.nome} fill className="object-cover" /> : <span className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-400">Sem imagem</span>}
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