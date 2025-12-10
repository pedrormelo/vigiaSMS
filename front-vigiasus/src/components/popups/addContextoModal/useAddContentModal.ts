// src/components/popups/addContextoModal/useAddContentModal.ts
import { useState, useEffect, useCallback, useMemo } from "react"; 
import { saveAs } from "file-saver";
import { 
    AbaAtiva, AbaFonteDeDados, TipoGrafico, ConjuntoDeDadosGrafico, 
    NomeIcone, DetalhesContexto, 
    TipoVersao, FormatoColuna, 
    ContextoPayload, DashboardPayload, IndicadorPayload,
    SubmitData
} from "./types";
import { showWarningToast, showErrorToast, showDispatchToast, showSuccessToast } from "@/components/ui/Toasts";
import { FileType } from "@/components/contextosCard/contextoCard";
import { uploadAndParseCsv } from "@/services/csvUploadService";

// --- DEFINIÇÕES DE TIPO DE ARQUIVO ---
const FILE_TYPE_DEFINITIONS: Record<FileType, { mimes: string[], extensions: string[], label: string }> = {
    'pdf': { mimes: ['application/pdf'], extensions: ['.pdf'], label: 'PDF' },
    'doc': { mimes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text'], extensions: ['.doc', '.docx', '.odt'], label: 'Documento' },
    'planilha': { mimes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet', 'text/csv', 'application/csv'], extensions: ['.xls', '.xlsx', '.ods', '.csv'], label: 'Planilha' },
    'apresentacao': { mimes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation'], extensions: ['.ppt', '.pptx', '.odp'], label: 'Apresentação' },
    'resolucao': { mimes: ['application/pdf'], extensions: ['.pdf'], label: 'Resolução (PDF)' },
    'leis': { mimes: ['application/pdf'], extensions: ['.pdf'], label: 'Lei (PDF)' },
    'dashboard': { mimes: [], extensions: [], label: 'Dashboard' },
    'indicador': { mimes: [], extensions: [], label: 'Indicador' },
    'link': { mimes: [], extensions: [], label: 'Link' },
};

const getAcceptString = (fileType: FileType | null): string => {
    if (fileType && FILE_TYPE_DEFINITIONS[fileType] && FILE_TYPE_DEFINITIONS[fileType].mimes.length > 0) {
        const def = FILE_TYPE_DEFINITIONS[fileType];
        return [...def.mimes, ...def.extensions].join(',');
    }
    
    return Object.values(FILE_TYPE_DEFINITIONS)
        .flatMap(def => [...def.mimes, ...def.extensions])
        .filter(Boolean)
        .join(',');
};

const detectarTipoPorArquivo = (arquivo: File): FileType | null => {
    const extensao = '.' + arquivo.name.split('.').pop()?.toLowerCase();
    for (const key in FILE_TYPE_DEFINITIONS) {
        const fileType = key as FileType;
        const def = FILE_TYPE_DEFINITIONS[fileType];
        if (def.mimes.includes(arquivo.type) || def.extensions.includes(extensao)) {
            return fileType;
        }
    }
    return null;
};
// --- FIM DAS DEFINIÇÕES ---

interface PropsDoHook {
    estaAberto: boolean;
    aoFechar: () => void;
    aoSubmeter: (dados: SubmitData) => void;
    abaInicial?: AbaAtiva;
    dadosIniciais?: Partial<DetalhesContexto> | null;
    arquivoAnexado?: File | null; 
}

export const useModalAdicionarConteudo = ({ 
    estaAberto, 
    aoFechar, 
    aoSubmeter, 
    abaInicial = 'contexto', 
    dadosIniciais, 
    arquivoAnexado
}: PropsDoHook) => {
    
    // --- ESTADOS GERAIS ---
    const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>(abaInicial);
    const [abaFonteDeDados, setAbaFonteDeDados] = useState<AbaFonteDeDados>('manual');
    const [arrastandoSobre, setArrastandoSobre] = useState(false); 

    // --- ESTADOS DE CONTEXTO ---
    const [tituloContexto, setTituloContexto] = useState("");
    const [detalhesContexto, setDetalhesContexto] = useState("");
    const [arquivoContexto, setArquivoContexto] = useState<File | null>(null);
    const [urlContexto, setUrlContexto] = useState("");
    const [tipoArquivoDetectado, setTipoArquivoDetectado] = useState<FileType | null>(null); 
    const [linkModalAberto, setLinkModalAberto] = useState(false);
    const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
    
    // --- ESTADOS DE NOVA VERSÃO ---
    const [isNewVersionMode, setIsNewVersionMode] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [tipoArquivoOriginal, setTipoArquivoOriginal] = useState<FileType | null>(null);
    const [tipoVersao, setTipoVersao] = useState<TipoVersao>(TipoVersao.CORRECAO);
    const [descricaoVersao, setDescricaoVersao] = useState("");

    // --- ESTADOS DE DASHBOARD ---
    const [tituloGrafico, setTituloGrafico] = useState("");
    const [detalhesGrafico, setDetalhesGrafico] = useState("");
    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("pie");
    const [arquivoDeDados, setArquivoDeDados] = useState<File | null>(null);
    const [conjuntoDeDados, setConjuntoDeDados] = useState<ConjuntoDeDadosGrafico>({
        colunas: ["Categoria", "Valor"],
        // Começa com uma linha vazia para edição, evitando render automático do gráfico
        linhas: [["", null]],
        cores: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
        formatos: ['text', 'number'],
    });
    // Formato global para as séries (todas as colunas após a primeira)
    const [formatoSeries, setFormatoSeries] = useState<FormatoColuna>('number');

    // --- ESTADOS DE INDICADOR ---
    const [tituloIndicador, setTituloIndicador] = useState("");
    const [descricaoIndicador, setDescricaoIndicador] = useState("");
    const [valorAtualIndicador, setValorAtualIndicador] = useState("");
    const [valorAlvoIndicador, setValorAlvoIndicador] = useState("");
    const [unidadeIndicador, setUnidadeIndicador] = useState("Nenhum");
    const [textoComparativoIndicador, setTextoComparativoIndicador] = useState("");
    const [corIndicador, setCorIndicador] = useState("#3B82F6");
    const [iconeIndicador, setIconeIndicador] = useState<NomeIcone>("Heart");

    const definirCoresDoGrafico = (novasCores: string[]) => {
        setConjuntoDeDados(dadosAtuais => ({ ...dadosAtuais, cores: novasCores }));
    };

    const reiniciarTodoOEstado = useCallback(() => {
        setTituloContexto(""); setDetalhesContexto(""); setArquivoContexto(null); setUrlContexto("");
        setIsNewVersionMode(false); setSelectedVersion("");
        setTipoArquivoDetectado(null); 
        setTipoArquivoOriginal(null);
        setTituloGrafico(""); setDetalhesGrafico(""); setTipoGrafico("pie");
        setArquivoDeDados(null);
        setConjuntoDeDados({
            colunas: ["Categoria", "Valor"],
            // Linha vazia padrão para entrada manual
            linhas: [["", null]],
            cores: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            formatos: ['text', 'number'], 
        });
        setFormatoSeries('number');
        setTituloIndicador(""); setDescricaoIndicador(""); setValorAtualIndicador("");
        setValorAlvoIndicador(""); setUnidadeIndicador("Nenhum"); setTextoComparativoIndicador("");
        setCorIndicador("#3B82F6"); setIconeIndicador("Heart");
        setAbaAtiva(abaInicial); setAbaFonteDeDados('manual');
        setTipoVersao(TipoVersao.CORRECAO);
        setDescricaoVersao("");
    }, [abaInicial]);

    useEffect(() => {
        if (estaAberto) {
            reiniciarTodoOEstado();
            setAbaAtiva(abaInicial);

            if (dadosIniciais) {
                setIsNewVersionMode(true);
                const proximaVersao = (dadosIniciais.versoes?.length || 0) + 1;
                setSelectedVersion(`v${proximaVersao}`);
                
                setTipoArquivoOriginal(dadosIniciais.type || null);
                
                setTituloContexto(dadosIniciais.title || "");
                setDetalhesContexto(dadosIniciais.description || "");
                
                if (dadosIniciais.type && dadosIniciais.type !== 'dashboard' && dadosIniciais.type !== 'indicador') {
                    setTipoArquivoDetectado(dadosIniciais.type);
                }
                if (dadosIniciais.type === 'link') {
                    setUrlContexto(dadosIniciais.url || "");
                }
                
                setTituloGrafico(dadosIniciais.title || "");
                setDetalhesGrafico(dadosIniciais.description || "");
                setTipoGrafico(dadosIniciais.chartType || 'pie');
                
                if (dadosIniciais.payload && dadosIniciais.type === 'dashboard') {
                    const payloadDash = dadosIniciais.payload as ConjuntoDeDadosGrafico;
                    const colunas = payloadDash.colunas || ["Categoria", "Valor"]; 
                    const linhasOrig = Array.isArray(payloadDash.linhas) ? payloadDash.linhas : [];
                    const temLinhas = linhasOrig.length > 0;
                    const linhaVazia = colunas.map((_, i) => (i === 0 ? "" : null));
                    const defaultSeriesFmt: FormatoColuna = (payloadDash.formatos && payloadDash.formatos[1]) ? payloadDash.formatos[1] as FormatoColuna : 'number';
                    setFormatoSeries(defaultSeriesFmt);
                    setConjuntoDeDados({
                        colunas,
                        // Mantém dados quando existem; caso contrário, fornece linha vazia para edição
                        linhas: temLinhas ? linhasOrig : [linhaVazia],
                        cores: payloadDash.cores || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
                        // Unificar formato das séries com base na primeira série
                        formatos: [
                            'text' as FormatoColuna,
                            ...colunas.slice(1).map(() => defaultSeriesFmt)
                        ],
                    });
                }

                if (dadosIniciais.type === 'indicador' && dadosIniciais.payload) {
                    type IndicadorPayloadAny = import('./types').IndicadorDetailsPayload & { valorAlvo?: string };
                    const payloadIndicador = dadosIniciais.payload as IndicadorPayloadAny; 
                    setTituloIndicador(dadosIniciais.title || "");
                    setDescricaoIndicador(payloadIndicador.description || dadosIniciais.description || "");
                    setValorAtualIndicador(payloadIndicador.valorAtual || "");
                    setValorAlvoIndicador(payloadIndicador.valorAlvo || "");
                    setUnidadeIndicador(payloadIndicador.unidade || "Nenhum");
                    setTextoComparativoIndicador(payloadIndicador.textoComparativo || "");
                    setCorIndicador(payloadIndicador.cor || "#3B82F6");
                    setIconeIndicador(payloadIndicador.icone || "Heart");
                }
            
            } else if (arquivoAnexado) {
                const tipoDetectado = detectarTipoPorArquivo(arquivoAnexado);

                // Se o usuário escolheu Dashboard no modal de escolha, não force contexto.
                if (abaInicial === 'dashboard') {
                    setAbaAtiva('dashboard');
                    setAbaFonteDeDados('arquivo');
                    setArquivoDeDados(arquivoAnexado);

                    const nomeSemExtensao = arquivoAnexado.name.split('.').slice(0, -1).join('.');
                    if (nomeSemExtensao) {
                        const tituloFormatado = nomeSemExtensao.replace(/[-_]/g, ' ');
                        setTituloGrafico(tituloFormatado);
                    }

                    // Processar o CSV imediatamente para já exibir o gráfico
                    (async () => {
                        try {
                            const { dataset, avisos } = await uploadAndParseCsv(arquivoAnexado);
                            aoProcessarDatasetDoCsv(dataset, avisos);
                            if (avisos?.length) {
                                avisos.forEach(aviso => showWarningToast("CSV Info", aviso));
                            }
                        } catch (err) {
                            const message = err instanceof Error ? err.message : 'Erro ao processar CSV';
                            showErrorToast("Erro ao processar CSV", message);
                        }
                    })();
                    return;
                }

                if (tipoDetectado && tipoDetectado !== 'dashboard' && tipoDetectado !== 'indicador') {
                    setArquivoContexto(arquivoAnexado);
                    setTipoArquivoDetectado(tipoDetectado);
                    setAbaAtiva('contexto'); 

                    const nomeSemExtensao = arquivoAnexado.name.split('.').slice(0, -1).join('.');
                    if (nomeSemExtensao) {
                        const tituloFormatado = nomeSemExtensao.replace(/[-_]/g, ' '); 
                        setTituloContexto(tituloFormatado);
                    }

                } else {
                    showErrorToast("Arquivo inválido", "O arquivo solto não é um tipo de contexto válido (PDF, DOC, etc).");
                    setArquivoContexto(null);
                }
            }
            setDashboardRefreshKey(k => k + 1);
        }
    }, [estaAberto, dadosIniciais, abaInicial, reiniciarTodoOEstado, arquivoAnexado]);

    
    const acceptString = useMemo(() => {
        if (isNewVersionMode && tipoArquivoOriginal && FILE_TYPE_DEFINITIONS[tipoArquivoOriginal].mimes.length > 0) {
            return getAcceptString(tipoArquivoOriginal);
        }
        return getAcceptString(null);
    }, [isNewVersionMode, tipoArquivoOriginal]);

    const helpText = useMemo(() => {
        if (isNewVersionMode && tipoArquivoOriginal && FILE_TYPE_DEFINITIONS[tipoArquivoOriginal].mimes.length > 0) {
            const def = FILE_TYPE_DEFINITIONS[tipoArquivoOriginal];
            return `Apenas arquivos ${def.label} (${def.extensions.join(', ')})`;
        }
        return "PDF, DOC, XLS, PPT, etc.";
    }, [isNewVersionMode, tipoArquivoOriginal]);


    const aoSelecionarArquivo = (arquivo: File | null) => {
        if (!arquivo) return;
        
        const LIMITE_TAMANHO_MB = 15;
        if (arquivo.size > LIMITE_TAMANHO_MB * 1024 * 1024) {
            showErrorToast("Arquivo muito grande", `O tamanho máximo é de ${LIMITE_TAMANHO_MB} MB.`);
            return;
        }

        const tipoDetectado = detectarTipoPorArquivo(arquivo);

        if (!tipoDetectado) {
            showErrorToast("Tipo de arquivo inválido", `Formato não permitido. Use: ${acceptString}`);
            setArquivoContexto(null);
            setTipoArquivoDetectado(null);
            return;
        }

        if (isNewVersionMode && tipoArquivoOriginal) {
            const eTipoDeArquivoOriginal = FILE_TYPE_DEFINITIONS[tipoArquivoOriginal].mimes.length > 0;
            
            if (eTipoDeArquivoOriginal && tipoDetectado !== tipoArquivoOriginal) {
                showErrorToast("Tipo de arquivo incorreto", `A nova versão deve ser do mesmo tipo do original (${FILE_TYPE_DEFINITIONS[tipoArquivoOriginal].label}).`);
                setArquivoContexto(null);
                setTipoArquivoDetectado(tipoArquivoOriginal); 
                return;
            }
        }

        setArquivoContexto(arquivo);
        setUrlContexto("");
        setTipoArquivoDetectado(tipoDetectado);
    };

    // Processa dataset a partir do upload de CSV
    const aoProcessarDatasetDoCsv = (dataset: ConjuntoDeDadosGrafico, avisos: string[]) => {
        setConjuntoDeDados(dataset);
        setFormatoSeries(dataset.formatos?.[1] || 'number');
        if (avisos.length > 0) {
            console.log('Avisos do CSV:', avisos);
        }
    };

    const aoSubmeterFormulario = () => {
        let payload: Partial<ContextoPayload> | Partial<DashboardPayload> | Partial<IndicadorPayload>;
        const versionInfo = isNewVersionMode ? { type: tipoVersao, description: descricaoVersao } : null;

        switch (abaAtiva) {
            case 'contexto':
                payload = { 
                    title: tituloContexto, 
                    details: detalhesContexto, 
                    file: arquivoContexto, 
                    url: urlContexto, 
                    versionInfo, 
                    fileType: tipoArquivoDetectado 
                };
                aoSubmeter({ type: 'contexto', payload: payload }); 
                break;

            case 'dashboard':
                payload = { title: tituloGrafico, details: detalhesGrafico, type: tipoGrafico, dataFile: arquivoDeDados, dataset: conjuntoDeDados, versionInfo };
                aoSubmeter({ type: 'dashboard', payload: payload });
                break;

            case 'indicador':
                payload = { titulo: tituloIndicador, descricao: descricaoIndicador, valorAtual: valorAtualIndicador, valorAlvo: valorAlvoIndicador, unidade: unidadeIndicador, textoComparativo: textoComparativoIndicador, cor: corIndicador, icone: iconeIndicador, versionInfo };
                aoSubmeter({ type: 'indicador', payload: payload });
                break;
        }
        // Nota: Os toasts de sucesso/erro são gerenciados pela página que chama 'aoSubmeter'
        aoFechar();
    };
    
    const aoClicarBotaoUrl = () => {
        if (isNewVersionMode && tipoArquivoOriginal && FILE_TYPE_DEFINITIONS[tipoArquivoOriginal].mimes.length > 0) {
            showErrorToast("Ação não permitida", "Você não pode alterar o tipo de 'Arquivo' para 'Link' em uma nova versão.");
            return;
        }
        setLinkModalAberto(true);
    };

    const aoConfirmarLink = (url: string) => {
        const trimmed = url.trim();
        try {
            const parsed = new URL(trimmed);
            if (!/^https?:$/.test(parsed.protocol)) {
                showErrorToast("URL inválida", "Use http:// ou https://");
                return;
            }
        } catch {
            showErrorToast("URL inválida", "Formato incorreto");
            return;
        }
        setUrlContexto(trimmed);
        setArquivoContexto(null);
        setTipoArquivoDetectado("link");
        setLinkModalAberto(false);
        showSuccessToast("Link adicionado ao contexto.");
    };

    const aoCancelarLink = () => setLinkModalAberto(false);

    const aoEntrarNaArea = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setArrastandoSobre(true); };
    const aoSairDaArea = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setArrastandoSobre(false); };
    const aoArrastarSobre = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const aoSoltarArquivo = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setArrastandoSobre(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            aoSelecionarArquivo(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const aoMudarTipoGrafico = (t: TipoGrafico) => setTipoGrafico(t);

    const adicionarLinha = () => {
        if (conjuntoDeDados.linhas.length >= 25) { showWarningToast("Limite de 25 linhas atingido."); return; }
        setConjuntoDeDados((d) => ({ ...d, linhas: [...d.linhas, ["", ...Array(d.colunas.length - 1).fill(null)]] }));
    };

    const removerLinha = (index: number) => setConjuntoDeDados((d) => ({ ...d, linhas: d.linhas.filter((_, i) => i !== index) }));

    const atualizarCelula = (linha: number, coluna: number, valor: string) => {
        let valorFinal: string | number | null = valor; 
        if (coluna > 0) { 
            const valorTrim = valor.trim();
            if (valorTrim === "") { valorFinal = null; } 
            else if (valorTrim.includes('-')) { showErrorToast("Valor inválido.", "Números negativos não são permitidos."); return; } 
            else {
                const valorLimpo = valorTrim.replace(/R\$|\s/g, '').replace(/\./g, (match, offset, original) => offset === original.lastIndexOf('.') ? '.' : '').replace(',', '.'); 
                const eFormatoNumero = /^\d*\.?\d*$/.test(valorLimpo);
                if (eFormatoNumero && valorLimpo) {
                    const num = parseFloat(valorLimpo);
                    valorFinal = !isNaN(num) ? num : null;
                } else if (valorTrim !== "") {
                    showErrorToast("Valor inválido.", "Apenas números são permitidos."); return; 
                } else { valorFinal = null; }
            }
        }
        setConjuntoDeDados((d) => ({ ...d, linhas: d.linhas.map((l, i) => i === linha ? l.map((c, j) => (j === coluna ? valorFinal : c)) : l)}));
    };

    const adicionarColuna = () => {
        if (conjuntoDeDados.colunas.length >= 30) { showWarningToast("Limite de 30 colunas atingido."); return; }
        setConjuntoDeDados((d) => ({ ...d, colunas: [...d.colunas, `Série ${d.colunas.length}`], linhas: d.linhas.map(linha => [...linha, null]), formatos: [...(d.formatos || []), formatoSeries] }));
    };

   const removerColuna = (indiceColuna: number) => {
        if (indiceColuna === 0) { showErrorToast("Ação não permitida", "A coluna de categorias não pode ser removida."); return; }
        if (conjuntoDeDados.colunas.length <= 2) { showErrorToast("Ação não permitida", "O gráfico precisa de pelo menos uma coluna de valores."); return; }
        setConjuntoDeDados((d) => ({ colunas: d.colunas.filter((_, i) => i !== indiceColuna), linhas: d.linhas.map(linha => linha.filter((_, i) => i !== indiceColuna)), formatos: d.formatos?.filter((_, i) => i !== indiceColuna) }));
    };

    const atualizarNomeColuna = (index: number, novoNome: string) => setConjuntoDeDados((d) => ({ ...d, colunas: d.colunas.map((col, i) => (i === index ? novoNome : col)) }));
    const atualizarFormatoColuna = (indiceColuna: number, novoFormato: FormatoColuna) => { setConjuntoDeDados(d => ({ ...d, formatos: d.formatos?.map((formato, i) => i === indiceColuna ? novoFormato : formato) })); };

    // Define o formato de TODAS as séries de uma vez
    const definirFormatoDasSeries = (novoFormato: FormatoColuna) => {
        setFormatoSeries(novoFormato);
        setConjuntoDeDados((d) => ({
            ...d,
            formatos: d.colunas.map((_, i) => (i === 0 ? 'text' : novoFormato)) as FormatoColuna[]
        }));
    };

    const baixarModelo = () => {
        // Gera template de exemplo com dados realistas baseado no tipo de gráfico e formato
        const colunas = conjuntoDeDados.colunas;
        const formatos = conjuntoDeDados.formatos || ['text', 'number'];
        
        // Categorias de exemplo
        const categorias = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'
        ];
        
        // Gera dados de exemplo baseado no formato
        const linhasExemplo = categorias.map((cat, idx) => {
            const valores = colunas.slice(1).map((_, colIdx) => {
                const formato = formatos[colIdx + 1] || 'number';
                
                if (formato === 'currency') {
                    // Moeda: valores realistas entre 1000 e 10000
                    return (1000 + Math.random() * 9000).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).replace('R$ ', '');
                } else if (formato === 'percent') {
                    // Percentual: valores entre 10 e 95
                    return ((10 + Math.random() * 85).toFixed(2)).replace('.', ',') + '%';
                } else {
                    // Número: valores entre 50 e 500
                    return Math.floor(50 + Math.random() * 450).toString();
                }
            });
            
            return [cat, ...valores].join(',');
        });
        
        // Monta CSV com cabeçalho e dados
        const cabecalho = colunas.join(",");
        const csv = [cabecalho, ...linhasExemplo].join("\n");
        
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `template-${tipoGrafico}-${new Date().getTime()}.csv`);
    };

    const formatarTamanhoArquivo = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024; const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
    };

    const obterNomeFonteContexto = () => {
        if (arquivoContexto) return arquivoContexto.name;
        if (urlContexto) return urlContexto;
        if (tipoArquivoDetectado) setTipoArquivoDetectado(null); 
        return "Nenhum arquivo ou link selecionado";
    };

    // --- VALIDACAO DE SUBMISSÃO ---
    const submissaoDesativada = (() => {
        const MIN_DETALHES_LENGTH = 15; // Alinhado com a validação visual

        switch (abaAtiva) {
            case 'contexto':
                if (isNewVersionMode) {
                    return !tipoVersao || !descricaoVersao.trim() || (!arquivoContexto && !urlContexto.trim());
                }
                // Verifica título, tamanho dos detalhes e se há arquivo/link
                return !tituloContexto.trim() || 
                       detalhesContexto.trim().length < MIN_DETALHES_LENGTH || 
                       (!arquivoContexto && !urlContexto.trim()) || 
                       !tipoArquivoDetectado;

            case 'dashboard':
                 if (isNewVersionMode) {
                    const dadosManuaisForamModificados = abaFonteDeDados === 'manual' && JSON.stringify(conjuntoDeDados) !== JSON.stringify(dadosIniciais?.payload);
                    const novoArquivoFoiEnviado = abaFonteDeDados === 'upload' && !!arquivoDeDados;
                    return !tipoVersao || !descricaoVersao.trim() || !(dadosManuaisForamModificados || novoArquivoFoiEnviado);
                }
                const temDadosManuais = abaFonteDeDados === 'manual' && conjuntoDeDados.linhas.length > 0 && conjuntoDeDados.linhas.some(l => l.slice(1).some(c => c !== null && c !== ''));
                const temArquivo = abaFonteDeDados === 'upload' && !!arquivoDeDados;
                return !tituloGrafico.trim() || 
                       detalhesGrafico.trim().length < MIN_DETALHES_LENGTH || 
                       (!temDadosManuais && !temArquivo);

            case 'indicador':
                if (isNewVersionMode) {
                    return !tipoVersao || !descricaoVersao.trim() || !valorAtualIndicador.trim();
                }
                return !tituloIndicador.trim() || 
                       descricaoIndicador.trim().length < MIN_DETALHES_LENGTH || 
                       !valorAtualIndicador.trim();

            default:
                return true;
        }
    })();
    
    return {
        abaAtiva, setAbaAtiva, aoCancelar: aoFechar, aoSubmeter: aoSubmeterFormulario, submissaoDesativada,
        tituloContexto, setTituloContexto, detalhesContexto, setDetalhesContexto, arquivoContexto, setArquivoContexto,
        urlContexto, setUrlContexto, arrastandoSobre, aoSelecionarArquivo, aoClicarBotaoUrl, aoEntrarNaArea,
        aoSairDaArea, aoArrastarSobre, aoSoltarArquivo, obterNomeFonteContexto, formatarTamanhoArquivo,
        acceptString, helpText, tipoArquivoDetectado, setTipoArquivoDetectado, tipoArquivoOriginal, 
        isNewVersionMode, selectedVersion, tipoVersao, setTipoVersao, descricaoVersao, setDescricaoVersao,
        abaFonteDeDados, setAbaFonteDeDados, tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo: aoMudarTipoGrafico, arquivoDeDados, setArquivoDeDados, aoProcessarDatasetDoCsv,
        conjuntoDeDados, definirCoresDoGrafico, adicionarLinha, removerLinha, atualizarCelula, adicionarColuna, removerColuna, atualizarNomeColuna,
        atualizarFormatoColuna, definirFormatoDasSeries, formatoSeries, baixarModelo, dashboardRefreshKey,
        tituloIndicador, setTituloIndicador, descricaoIndicador, setDescricaoIndicador, valorAtualIndicador,
        setValorAtualIndicador, valorAlvoIndicador, setValorAlvoIndicador, unidadeIndicador, setUnidadeIndicador,
        textoComparativoIndicador, setTextoComparativoIndicador, corIndicador, setCorIndicador, iconeIndicador, setIconeIndicador,
        linkModalAberto, aoConfirmarLink, aoCancelarLink, setLinkModalAberto,
    };
};