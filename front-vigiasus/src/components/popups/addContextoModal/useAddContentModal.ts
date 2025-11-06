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
import { showWarningToast, showErrorToast, showDispatchToast } from "@/components/ui/Toasts";
import { FileType } from "@/components/contextosCard/contextoCard";
import { cn } from "@/lib/utils";

// --- DEFINIÇÕES DE TIPO DE ARQUIVO ---
const FILE_TYPE_DEFINITIONS: Record<FileType, { mimes: string[], extensions: string[], label: string }> = {
    'pdf': { mimes: ['application/pdf'], extensions: ['.pdf'], label: 'PDF' },
    'doc': { mimes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text'], extensions: ['.doc', '.docx', '.odt'], label: 'Documento' },
    'planilha': { mimes: ['application/vnd.ms-planilha', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet'], extensions: ['.xls', '.xlsx', '.ods'], label: 'Planilha' },
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

// Definindo a interface das Props do Hook
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
        linhas: [["Exemplo de Categoria", 100]],
        cores: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
        formatos: ['text', 'number'],
    });

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
            linhas: [["Exemplo de Categoria", 100]],
            cores: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            formatos: ['text', 'number'], 
        });
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
                // --- LÓGICA MODO EDIÇÃO (Nova Versão) ---
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
                    setConjuntoDeDados({
                        colunas: payloadDash.colunas || ["Categoria", "Valor"],
                        linhas: payloadDash.linhas || [],
                        cores: payloadDash.cores || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
                        formatos: payloadDash.formatos || [
                            'text' as FormatoColuna, 
                            ...(payloadDash.colunas?.slice(1).map(() => 'number' as FormatoColuna) || ['number' as FormatoColuna])
                        ],
                    });
                }

                if (dadosIniciais.type === 'indicador' && dadosIniciais.payload) {
                    const payloadIndicador = dadosIniciais.payload as any; 
                    setTituloIndicador(dadosIniciais.title || "");
                    setDescricaoIndicador(payloadIndicador.description || dadosIniciais.description || "");
                    setValorAtualIndicador(payloadIndicador.valorAtual || dadosIniciais.valorAtual || "");
                    setValorAlvoIndicador(dadosIniciais.valorAlvo || "");
                    setUnidadeIndicador(payloadIndicador.unidade || dadosIniciais.unidade || "Nenhum");
                    setTextoComparativoIndicador(payloadIndicador.textoComparativo || dadosIniciais.textoComparativo || "");
                    setCorIndicador(payloadIndicador.cor || dadosIniciais.cor || "#3B82F6");
                    setIconeIndicador(payloadIndicador.icone || dadosIniciais.icone || "Heart");
                }
            
            } else if (arquivoAnexado) {
                // --- LÓGICA MODO CRIAÇÃO (via Drag-and-Drop) ---
                const tipoDetectado = detectarTipoPorArquivo(arquivoAnexado);
                
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
                setTipoArquivoDetectado(tipoArquivoOriginal); // Mantém o tipo original
                return;
            }
        }

        setArquivoContexto(arquivo);
        setUrlContexto("");
        setTipoArquivoDetectado(tipoDetectado);
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
                showDispatchToast("Seu contexto foi enviado para aprovação do gerente.");
                break;

            case 'dashboard':
                payload = { title: tituloGrafico, details: detalhesGrafico, type: tipoGrafico, dataFile: arquivoDeDados, dataset: conjuntoDeDados, versionInfo };
                aoSubmeter({ type: 'dashboard', payload: payload });
                showDispatchToast("Seu dashboard foi enviado para aprovação.");
                break;

            case 'indicador':
                payload = { titulo: tituloIndicador, descricao: descricaoIndicador, valorAtual: valorAtualIndicador, valorAlvo: valorAlvoIndicador, unidade: unidadeIndicador, textoComparativo: textoComparativoIndicador, cor: corIndicador, icone: iconeIndicador, versionInfo };
                aoSubmeter({ type: 'indicador', payload: payload });
                showDispatchToast("Seu indicador foi enviado para aprovação.");
                break;
        }
        aoFechar();
    };
    
    const aoClicarBotaoUrl = () => {
        if (isNewVersionMode && tipoArquivoOriginal && FILE_TYPE_DEFINITIONS[tipoArquivoOriginal].mimes.length > 0) {
            showErrorToast("Ação não permitida", "Você não pode alterar o tipo de 'Arquivo' para 'Link' em uma nova versão.");
            return;
        }
        const url = prompt("Por favor, insira a URL:");
        if (url) { 
            setUrlContexto(url); 
            setArquivoContexto(null); 
            setTipoArquivoDetectado("link");
        }
    };

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

    const aoMudarTipoGrafico = (t: TipoGrafico) => {
        setTipoGrafico(t);
    };

    // --- LÓGICA DA TABELA DO DASHBOARD ---

    const adicionarLinha = () => {
        if (conjuntoDeDados.linhas.length >= 25) {
            showWarningToast("Limite de 25 linhas atingido.");
            return;
        }
        setConjuntoDeDados((d) => ({ ...d, linhas: [...d.linhas, ["", ...Array(d.colunas.length - 1).fill(null)]] }));
    };

    const removerLinha = (index: number) => setConjuntoDeDados((d) => ({ ...d, linhas: d.linhas.filter((_, i) => i !== index) }));

    const atualizarCelula = (linha: number, coluna: number, valor: string) => {
        let valorFinal: string | number | null = valor; 

        if (coluna > 0) { 
            const valorTrim = valor.trim();
            
            if (valorTrim === "") {
                valorFinal = null; 
            } else if (valorTrim.includes('-')) {
                showErrorToast("Valor inválido.", "Números negativos não são permitidos.");
                return; 
            } else {
                const valorLimpo = valorTrim
                    .replace(/R\$|\s/g, '')
                    .replace(/\./g, (match, offset, original) => offset === original.lastIndexOf('.') ? '.' : '') 
                    .replace(',', '.'); 

                const eFormatoNumero = /^\d*\.?\d*$/.test(valorLimpo);

                if (eFormatoNumero && valorLimpo) {
                    const num = parseFloat(valorLimpo);
                    if (!isNaN(num)) {
                        valorFinal = num; 
                    } else {
                        valorFinal = null; 
                    }
                } else if (valorTrim !== "") {
                    showErrorToast("Valor inválido.", "Apenas números são permitidos.");
                    return; 
                } else {
                    valorFinal = null;
                }
            }
        }
        
        setConjuntoDeDados((d) => ({ ...d, linhas: d.linhas.map((l, i) => 
            i === linha ? l.map((c, j) => (j === coluna ? valorFinal : c)) : l
        )}));
    };

   const adicionarColuna = () => {
        if (conjuntoDeDados.colunas.length >= 30) {
            showWarningToast("Limite de 30 colunas atingido.");
            return;
        }
        setConjuntoDeDados((d) => ({
            ...d,
            colunas: [...d.colunas, `Série ${d.colunas.length}`],
            linhas: d.linhas.map(linha => [...linha, null]), 
            formatos: [...(d.formatos || []), 'number'] 
        }));
    };

   const removerColuna = (indiceColuna: number) => {
        if (indiceColuna === 0) {
            showErrorToast("Ação não permitida", "A coluna de categorias não pode ser removida."); return;
        }
        if (conjuntoDeDados.colunas.length <= 2) {
            showErrorToast("Ação não permitida", "O gráfico precisa de pelo menos uma coluna de valores."); return;
        }
        setConjuntoDeDados((d) => ({
            colunas: d.colunas.filter((_, i) => i !== indiceColuna),
            linhas: d.linhas.map(linha => linha.filter((_, i) => i !== indiceColuna)),
            formatos: d.formatos?.filter((_, i) => i !== indiceColuna) 
        }));
    };

    const atualizarNomeColuna = (index: number, novoNome: string) => setConjuntoDeDados((d) => ({ ...d, colunas: d.colunas.map((col, i) => (i === index ? novoNome : col)) }));

    const atualizarFormatoColuna = (indiceColuna: number, novoFormato: FormatoColuna) => {
        setConjuntoDeDados(d => ({
            ...d,
            formatos: d.formatos?.map((formato, i) => i === indiceColuna ? novoFormato : formato)
        }));
    };

    const baixarModelo = () => {
        const cabecalho = conjuntoDeDados.colunas.join(",") + "\n";
        const linhasExemplo = Array(2).fill(Array(conjuntoDeDados.colunas.length).fill("dado")).map(r => r.join(",")).join("\n");
        const csv = cabecalho + linhasExemplo;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `modelo-${tipoGrafico}.csv`);
    };

    // --- FUNÇÕES UTILITÁRIAS ---

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

    // --- LÓGICA DE SUBMISSÃO (ATUALIZADA) ---
    
    const submissaoDesativada = (() => {
        // Define o mínimo de caracteres para os detalhes
        const MIN_DETALHES_LENGTH = 15; 

        switch (abaAtiva) {
            case 'contexto':
                if (isNewVersionMode) {
                    // (Nova Versão) Precisa de descrição da VERSÃO (obrigatório) E (arquivo OU url)
                    return !tipoVersao || !descricaoVersao.trim() || (!arquivoContexto && !urlContexto.trim());
                }
                
                // (Novo) Precisa de título, DETALHES (com min 15 chars), (arquivo OU url) E tipo detectado
                return !tituloContexto.trim() || 
                       detalhesContexto.trim().length < MIN_DETALHES_LENGTH || 
                       (!arquivoContexto && !urlContexto.trim()) || 
                       !tipoArquivoDetectado;

            case 'dashboard':
                 if (isNewVersionMode) {
                    // (Nova Versão)
                    const dadosManuaisForamModificados = abaFonteDeDados === 'manual' && JSON.stringify(conjuntoDeDados) !== JSON.stringify(dadosIniciais?.payload);
                    const novoArquivoFoiEnviado = abaFonteDeDados === 'upload' && !!arquivoDeDados;
                    const dadosForamAlterados = dadosManuaisForamModificados || novoArquivoFoiEnviado;
                    
                    return !tipoVersao || !descricaoVersao.trim() || !dadosForamAlterados;
                }
                // (Novo)
                const temDadosManuais = abaFonteDeDados === 'manual' && conjuntoDeDados.linhas.length > 0 && conjuntoDeDados.linhas.some(l => l.slice(1).some(c => c !== null && c !== ''));
                const temArquivo = abaFonteDeDados === 'upload' && !!arquivoDeDados;
                
                // (Novo) Precisa de título, DETALHES (mín 15) E (dados manuais OU arquivo)
                return !tituloGrafico.trim() || 
                       detalhesGrafico.trim().length < MIN_DETALHES_LENGTH || 
                       (!temDadosManuais && !temArquivo);

            case 'indicador':
                if (isNewVersionMode) {
                    // (Nova Versão) Precisa de descrição da VERSÃO e VALOR ATUAL
                    return !tipoVersao || !descricaoVersao.trim() || !valorAtualIndicador.trim();
                }
                
                // (Novo) Precisa de título, DESCRIÇÃO (mín 15) e VALOR ATUAL
                return !tituloIndicador.trim() || 
                       descricaoIndicador.trim().length < MIN_DETALHES_LENGTH || 
                       !valorAtualIndicador.trim();

            default:
                return true;
        }
    })();
    
    // --- RETORNO DO HOOK ---
    return {
        abaAtiva, setAbaAtiva, aoCancelar: aoFechar, aoSubmeter: aoSubmeterFormulario, submissaoDesativada,
        
        // Contexto
        tituloContexto, setTituloContexto, detalhesContexto, setDetalhesContexto, arquivoContexto, setArquivoContexto,
        urlContexto, setUrlContexto, arrastandoSobre, aoSelecionarArquivo, aoClicarBotaoUrl, aoEntrarNaArea,
        aoSairDaArea, aoArrastarSobre, aoSoltarArquivo, obterNomeFonteContexto, formatarTamanhoArquivo,
        acceptString, 
        helpText,     
        tipoArquivoDetectado,
        tipoArquivoOriginal, 
        
        // Nova Versão
        isNewVersionMode, selectedVersion, tipoVersao, setTipoVersao, descricaoVersao, setDescricaoVersao,
        
        // Dashboard
        abaFonteDeDados, setAbaFonteDeDados, tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo: aoMudarTipoGrafico, arquivoDeDados, setArquivoDeDados,
        conjuntoDeDados, definirCoresDoGrafico,
        adicionarLinha, removerLinha, atualizarCelula, adicionarColuna, removerColuna, atualizarNomeColuna,
        atualizarFormatoColuna,
        baixarModelo, 
        
        // Indicador
        tituloIndicador, setTituloIndicador, descricaoIndicador, setDescricaoIndicador, valorAtualIndicador,
        setValorAtualIndicador, valorAlvoIndicador, setValorAlvoIndicador, unidadeIndicador, setUnidadeIndicador,
        textoComparativoIndicador, setTextoComparativoIndicador, corIndicador, setCorIndicador, iconeIndicador, setIconeIndicador,
    };
};