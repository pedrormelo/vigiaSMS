<<<<<<< HEAD
// src/app/gerencia/[slug]/page.tsx
"use client";

import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation'; // useParams pegará o slug
import { Edit, Eye, SearchX, UploadCloud, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils"; 

// Hooks
import { useDebounce } from "@/hooks/useDebounce";
import { useStaleness } from "@/hooks/useStaleness";

// Componentes da UI e Popups
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
import { showSuccessToast } from "@/components/ui/Toasts";
import OcultarContextoModal from "@/components/popups/ocultarContextoModal";

// Componentes do Carrossel
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Tipos
import type { FileType } from "@/components/contextosCard/contextoCard";
import type { AbaAtiva, DetalhesContexto, NomeIcone, SubmitData, IndicadorDetailsPayload, TipoGrafico } from "@/components/popups/addContextoModal/types";
import { Contexto, StatusContexto } from "@/components/validar/typesDados";

// Serviços (AQUI ESTÁ A MUDANÇA PRINCIPAL)
import { getContextosPorGerencia } from "@/services/contextoService"; 
import { getGerenciaBySlug, Gerencia } from "@/services/organizacaoService";

export default function GerenciaPage() {
    // --- ROTEAMENTO E DADOS DINÂMICOS ---
    const params = useParams();
    // Assumindo que você renomeou a pasta para [slug], o parametro será 'slug'.
    // Se ainda estiver como [id], o next enviará 'id' com o valor do slug. 
    const slug = (params?.slug as string) || (params?.id as string) || "";

    // Estado para armazenar os dados da gerência vindos do banco
    const [gerenciaData, setGerenciaData] = useState<Gerencia | null>(null);

    // --- ESTADOS DE UI E FILTROS ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [abaInicial, setAbaInicial] = useState<AbaAtiva>('contexto');
    const [modo, setModo] = useState<'visualizacao' | 'edicao'>('visualizacao');
    const [dadosParaEditar, setDadosParaEditar] = useState<Partial<DetalhesContexto> | null>(null);
    const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
    const [ficheiroSelecionado, setFicheiroSelecionado] = useState<DetalhesContexto | null>(null);
    const [perfil] = useState<'diretor' | 'gerente' | 'membro'>('membro');
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState<'recente' | 'todas'>("todas");
    const [selectedTypes, setSelectedTypes] = useState<FileType[]>([]);
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const [isDragging, setIsDragging] = useState(false); 
    const [arquivoAnexadoPorDrop, setArquivoAnexadoPorDrop] = useState<File | null>(null);

    // --- DADOS EM ESTADO ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [todosOsContextos, setTodosOsContextos] = useState<Contexto[]>([]); 
    
    // --- Modal de ocultar ---
    const [modalOcultarAberto, setModalOcultarAberto] = useState(false);
    const [contextoParaOcultar, setContextoParaOcultar] = useState<Contexto | null>(null);
    
    const autoplayPlugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    // --- EFEITO PRINCIPAL: BUSCAR DADOS DA GERÊNCIA E CONTEXTOS ---
    useEffect(() => {
        if (slug) { 
            const carregarDados = async () => {
                try {
                    setIsLoading(true);
                    setError(null);

                    // 1. Busca os dados da Gerência pelo Slug
                    const gerenciaEncontrada = await getGerenciaBySlug(slug);
                    
                    if (!gerenciaEncontrada) {
                        throw new Error("Gerência não encontrada.");
                    }

                    setGerenciaData(gerenciaEncontrada);

                    // 2. Com o ID da gerência, busca os contextos
                    // (getContextosPorGerencia provavelmente espera um ID, não um slug)
                    const contextos = await getContextosPorGerencia(gerenciaEncontrada.id); 
                    setTodosOsContextos(contextos);

                } catch (err: any) {
                    console.error("Erro ao buscar dados:", err);
                    setError(err.message || "Não foi possível carregar os dados.");
                } finally {
                    setIsLoading(false);
                }
            };
            carregarDados();
        } else {
             setError("Slug da gerência não encontrado na URL.");
             setIsLoading(false);
        }
    }, [slug]); 


    // --- HOOK DE STALENESS ---
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

    const { variant: stalenessVariant, label: stalenessLabel, lastUpdatedAt } = useStaleness({
        extractors: stalenessExtractors, 
        thresholds: { recentDays: 7, staleDays: 30 },
        locale: 'pt-BR'
    });


    // --- LÓGICA DE FILTRAGEM ---
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


    // --- HANDLERS DE EVENTOS ---
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

    // Função auxiliar para mapear Indicadores
    const mapContextToIndicatorProps = (indicator: Contexto) => {
        if (indicator.type !== 'indicador' || !indicator.payload) {
            return {
                id: indicator.id,
                title: indicator.title,
                value: "N/A",
                unidade: "",
                subtitle: indicator.description || "Dados inválidos",
                status: indicator.status,
                estaOculto: indicator.estaOculto,
                borderColor: "border-l-red-500",
                iconType: "cruz" as keyof typeof indicatorIcons,
                versoes: indicator.versoes || [],
                insertedDate: indicator.insertedDate,
                solicitante: indicator.solicitante,
                gerencia: indicator.gerencia,
                autor: indicator.solicitante,
                historico: indicator.historico,
            };
        }
        
        const payload = indicator.payload as IndicadorDetailsPayload; 
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
            unidade: payload.unidade || "N/A",
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

    const aoSubmeterConteudo = (dados: SubmitData) => {
        // Aqui você implementaria a chamada ao backend para criar
        console.log("Novo conteúdo (simulado):", dados);
        fecharModalAdicionar();
        // Dica: Recarregue os dados chamando getContextosPorGerencia novamente ou atualize o estado local
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

    // Drag and Drop Handlers
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


    // --- RENDERIZAÇÃO ---
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
                {/* Seção Indicadores */}
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

                {/* Staleness */}
                <div className="mb-3">
                    <StatusBadge variant={stalenessVariant} label={stalenessLabel} />
                </div>

                {/* Filtros */}
                <FilterBar searchValue={searchValue} onSearchChange={setSearchValue} activeTab={activeTab} onTabChange={setActiveTab} selectedTypes={selectedTypes} onSelectedTypesChange={handleSelectedTypesChange} clearTypeFilter={() => setSelectedTypes([])} />
                
                {/* Grade de Arquivos */}
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

            {/* Header Dinâmico com cores do Banco de Dados */}
            <div className="relative p-8 mb-6 text-white shadow-lg" 
                 style={{ 
                     background: diretoria?.bannerImage 
                        ? `url(${diretoria.bannerImage}) center/cover`
                        : `linear-gradient(to right, ${diretoria?.corFrom || '#ccc'}, ${diretoria?.corTo || '#999'})` 
                 }}>
                <h2 className="text-3xl font-regular mt-1">{diretoria?.nome || "Diretoria"}</h2>
            </div>
            
            <div className="container mx-auto p-6">

                {/* Banner de Staleness */}
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

                {/* Título e Botão */}
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

                {/* Dashboard */}
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
                
                {/* Sobre a Gerência */}
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

            {/* Overlay de Upload */}
            {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-none">
                    <UploadCloud className="w-32 h-32 text-white/90 animate-pulse" />
                    <p className="mt-4 text-3xl font-bold text-white">Solte para adicionar</p>
                </div>
            )}
        </div>
=======
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
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
    );
}