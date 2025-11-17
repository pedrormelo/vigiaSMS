// src/app/gerencia/[slug]/page.tsx
"use client";

import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Edit, Eye, SearchX, UploadCloud, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils"; 

// Hooks
import { useDebounce } from "@/hooks/useDebounce";
import { useStaleness } from "@/hooks/useStaleness";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Componentes
import { FileGrid } from "@/components/contextosCard/contextosGrid";
import FilterBar from "@/components/gerencia/painel-filterBar";
import { AddIndicatorButton } from "@/components/indicadores/adicionarIndicador";
import { IndicatorCard } from "@/components/indicadores/indicadorCard";
import { icons as indicatorIcons } from '@/components/indicadores/indicadorCard';
import { AddDashboardButton } from "@/components/gerencia/dashboard-btn1";
import GerenciaDashboardPreview from "@/components/gerencia/dashboard/gerencia-dashboard-preview";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal/index";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";
import StatusBadge from "@/components/alerts/statusBadge";
import StatusBanner from "@/components/ui/status-banner";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
import OcultarContextoModal from "@/components/popups/ocultarContextoModal";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, NomeIcone, SubmitData, IndicadorDetailsPayload } from "@/components/popups/addContextoModal/types";
import { Contexto, StatusContexto } from "@/components/validar/typesDados";

import { getContextosPorGerencia, criarContexto, CriarContextoData } from "@/services/contextoService"; 
import { getGerenciaBySlug, Gerencia } from "@/services/organizacaoService";

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
    
    const [modalOcultarAberto, setModalOcultarAberto] = useState(false);
    const [contextoParaOcultar, setContextoParaOcultar] = useState<Contexto | null>(null);
    
    const autoplayPlugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
    );

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

    // --- LÓGICA DE ENVIO AO BACKEND ---
    
    // Helper para converter tipos do frontend para o ENUM do Banco
    const mapGraphicType = (type: string): string => {
        const t = type.toLowerCase();
        if (t === 'chart' || t === 'bar') return 'BAR';
        if (t === 'pie') return 'PIE';
        if (t === 'line') return 'LINE';
        return 'BAR'; // Fallback seguro
    };

    const aoSubmeterConteudo = async (dados: SubmitData) => {
        try {
            let titulo = "";
            let descricao = "";
            let backendTipo: 'ARQUIVO_LINK' | 'DASHBOARD' | 'INDICADOR' = 'ARQUIVO_LINK';
            let arquivoFisico: File | null | undefined = null;

            if (dados.type === 'contexto') {
                titulo = dados.payload.title || "";
                descricao = dados.payload.details || "";
                arquivoFisico = dados.payload.file;
                backendTipo = 'ARQUIVO_LINK';
            } 
            else if (dados.type === 'dashboard') {
                titulo = dados.payload.title || "";
                descricao = dados.payload.details || "";
                backendTipo = 'DASHBOARD';
            } 
            else if (dados.type === 'indicador') {
                titulo = dados.payload.titulo || "";
                descricao = dados.payload.descricao || "";
                backendTipo = 'INDICADOR';
            }

            if (!titulo) throw new Error("O título é obrigatório.");

            const payload: CriarContextoData = {
                tituloConceitual: titulo, 
                tipo: backendTipo,
                titulo: titulo, 
                descricao: descricao,
            };

            if (dados.type === 'contexto') {
                if (dados.payload.url) {
                    payload.linkUrl = dados.payload.url;
                }
            }
            else if (dados.type === 'dashboard') {
                if (dados.payload.dataset) {
                     // CORREÇÃO: Mapeia corretamente para o Enum do Prisma
                     payload.tipoGrafico = mapGraphicType(dados.payload.type || 'chart');
                     payload.dashboardPayload = dados.payload.dataset; 
                }
            }
            else if (dados.type === 'indicador') {
                payload.valorAtual = dados.payload.valorAtual;
                payload.valorAlvo = dados.payload.valorAlvo;
                payload.unidade = dados.payload.unidade;
                payload.textoComparativo = dados.payload.textoComparativo;
                payload.cor = dados.payload.cor;
                payload.icone = dados.payload.icone;
            }

            await criarContexto(payload, arquivoFisico);

            showSuccessToast("Contexto enviado com sucesso! Aguardando aprovação.");
            fecharModalAdicionar();
            carregarDados(); 

        } catch (err: any) {
            console.error("Erro ao criar contexto:", err);
            // Mostra mensagem amigável se vier do backend
            showErrorToast(err.message || "Erro ao enviar contexto.");
        }
    };

    // ... (O restante do código permanece igual: hooks de staleness, filtros, handlers, renderização) ...
    // Para brevidade, mantenha o código existente abaixo desta linha.
    
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
            const matchesStatus = ctx.status === StatusContexto.Publicado;
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

    const mapContextToIndicatorProps = (indicator: Contexto) => {
        const payload = indicator.payload as IndicadorDetailsPayload; 

        if (indicator.type !== 'indicador' || !payload) {
             return {
                id: indicator.id,
                title: indicator.title,
                value: "0",
                unidade: "",
                subtitle: indicator.description || "Sem dados",
                status: indicator.status,
                estaOculto: indicator.estaOculto,
                borderColor: "border-l-gray-500",
                iconType: "cruz" as keyof typeof indicatorIcons,
                versoes: indicator.versoes || [],
                insertedDate: indicator.insertedDate,
                solicitante: indicator.solicitante,
                gerencia: indicator.gerencia,
                autor: indicator.solicitante,
                historico: indicator.historico,
            };
        }
        
        const iconName = (payload.icone || "Heart") as NomeIcone;
        const iconMap: Record<NomeIcone, keyof typeof indicatorIcons> = {
            Heart: "cuidados", Building: "unidades", ClipboardList: "servidores",
            TrendingUp: "atividade", Landmark: "cruz", Users: "populacao",
            UserCheck: "medicos", DollarSign: "ambulancia",
        };
        
        const borderColorMap: { [key: string]: string } = {
            "#3B82F6": "border-l-blue-500", "#22C55E": "border-l-green-500",
            "#EF4444": "border-l-red-500", "#EAB308": "border-l-yellow-500",
            "#A855F7": "border-l-purple-500", "#F97316": "border-l-orange-500",
            "#14B8A6": "border-l-teal-500", "#EC4899": "border-l-pink-500",
        };

        const changeTypeMap = (text: string = ""): "positive" | "negative" | "neutral" => {
            if (text.startsWith('+')) return 'positive';
            if (text.startsWith('-')) return 'negative';
            return 'neutral';
        };

        return {
            id: indicator.id,
            title: indicator.title,
            value: payload.valorAtual || "0",
            unidade: payload.unidade || "",
            subtitle: payload.description || indicator.description || "",
            change: payload.textoComparativo || "",
            changeType: changeTypeMap(payload.textoComparativo),
            borderColor: borderColorMap[payload.cor] || "border-l-gray-500",
            iconType: iconMap[iconName] || "cruz",
            status: indicator.status,
            estaOculto: indicator.estaOculto,
            versoes: indicator.versoes || [],
            insertedDate: indicator.insertedDate,
            solicitante: indicator.solicitante,
            gerencia: indicator.gerencia,
            autor: indicator.solicitante, 
            historico: indicator.historico,
        };
    };

    const lidarComVisualizarIndicador = (indicator: Contexto) => {
        setFicheiroSelecionado(indicator); 
        setModalVisualizacaoAberto(true);
    };

    const aoClicarArquivo = (ficheiro: Contexto) => {
        setFicheiroSelecionado(ficheiro); 
        setModalVisualizacaoAberto(true);
    };
    
    const lidarComAlternarVisibilidadeContexto = (contextoId: string) => {
        const contexto = todosOsContextos.find(f => f.id === contextoId);
        if (!contexto) return;

        if (contexto.estaOculto) {
            setTodosOsContextos(prev =>
                prev.map(ctx => 
                    ctx.id === contextoId ? { ...ctx, estaOculto: false } : ctx
                )
            );
            showSuccessToast("Contexto reexibido com sucesso.");
        } else {
            setContextoParaOcultar(contexto);
            setModalOcultarAberto(true);
        }
    };
    
    const handleConfirmarOcultar = () => {
        if (!contextoParaOcultar) return;
        const contextoId = contextoParaOcultar.id;
        setTodosOsContextos(prev =>
            prev.map(ctx => 
                ctx.id === contextoId ? { ...ctx, estaOculto: true } : ctx
            )
        );
        showSuccessToast("Contexto ocultado com sucesso.");
        setModalOcultarAberto(false);
        setContextoParaOcultar(null);
    };

    const handleCancelarOcultar = () => {
        setModalOcultarAberto(false);
        setContextoParaOcultar(null);
    };
    
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
        const itemsIndicadores = filteredIndicators.map((indicatorCtx) => {
            const props = mapContextToIndicatorProps(indicatorCtx);
            return (
                <IndicatorCard 
                    key={props.id} 
                    {...props} 
                    id={indicatorCtx.id}
                    onClick={() => lidarComVisualizarIndicador(indicatorCtx)} 
                />
            );
        });
        
        if (modo === 'edicao') {
            itemsIndicadores.unshift(<AddIndicatorButton key="add-indicator" onClick={() => abrirModal('indicador')} />);
        }

        return (
            <>
                <div className="mb-16">
                    {itemsIndicadores.length > 0 ? (
                         itemsIndicadores.length > 4 && modo === 'visualizacao' ? (
                             <Carousel plugins={[autoplayPlugin.current]} opts={{ align: "start", loop: true }} className="w-full max-w-full mx-auto" onMouseEnter={autoplayPlugin.current.stop} onMouseLeave={autoplayPlugin.current.play}>
                                 <CarouselContent className="-ml-4">
                                     {itemsIndicadores.map((item, index) => (
                                         <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                             <div className="p-1 h-full">{item}</div>
                                         </CarouselItem>
                                     ))}
                                 </CarouselContent>
                             </Carousel>
                         ) : (
                             <div className="flex justify-center items-center gap-4 flex-wrap">
                                 {itemsIndicadores}
                             </div>
                         )
                    ) : (
                         <div className="text-sm text-center text-gray-500 py-4">(Nenhum indicador publicado)</div>
                    )}
                </div>

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
            />

            <OcultarContextoModal
                open={modalOcultarAberto}
                onOpenChange={setModalOcultarAberto}
                onCancel={handleCancelarOcultar}
                onConfirm={handleConfirmarOcultar}
                contextoNome={contextoParaOcultar?.title || ''}
            />

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
                    <button onClick={() => setModo(modo === 'visualizacao' ? 'edicao' : 'visualizacao')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-md">
                        {modo === 'visualizacao' ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        {modo === 'visualizacao' ? 'Modo de Edição' : 'Modo de Visualização'}
                    </button>
                </div>

                <div className="flex items-center gap-1 mb-7">
                    <h1 className="text-3xl mr-2 text-blue-600">Dashboard</h1>
                    {modo === 'edicao' && <AddDashboardButton onClick={() => abrirModal('dashboard')} />}
                </div>
                <div className="mb-10">
                    <GerenciaDashboardPreview 
                        graphs={filteredDashboards} 
                        gerencia={gerenciaData.id} 
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