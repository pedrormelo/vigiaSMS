// src/components/popups/addContextoModal/useAddContentModal.ts
import { useState, useEffect, useCallback } from "react"; 
import { saveAs } from "file-saver";
import { AbaAtiva, AbaFonteDeDados, TipoGrafico, ConjuntoDeDadosGrafico, ModalAdicionarConteudoProps, NomeIcone, DetalhesContexto, TipoVersao, FormatoColuna } from "./types";
import { showWarningToast, showErrorToast, showDispatchToast } from "@/components/ui/Toasts";

interface PropsDoHook extends ModalAdicionarConteudoProps {
    dadosIniciais?: Partial<DetalhesContexto> & { description?: string; payload?: Partial<ConjuntoDeDadosGrafico>; chartType?: TipoGrafico } | null;
}

export const useModalAdicionarConteudo = ({ estaAberto, aoFechar, aoSubmeter, abaInicial = 'contexto', dadosIniciais }: PropsDoHook) => {
    // --- ESTADOS GERAIS ---
    const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>(abaInicial);
    const [abaFonteDeDados, setAbaFonteDeDados] = useState<AbaFonteDeDados>('manual');
    const [arrastandoSobre, setArrastandoSobre] = useState(false);

    // --- ESTADOS DO CONTEXTO ---
    const [tituloContexto, setTituloContexto] = useState("");
    const [detalhesContexto, setDetalhesContexto] = useState("");
    const [arquivoContexto, setArquivoContexto] = useState<File | null>(null);
    const [urlContexto, setUrlContexto] = useState("");
    const [isNewVersionMode, setIsNewVersionMode] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState("");

    // --- ESTADOS DO DASHBOARD ---
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

    const definirCoresDoGrafico = (novasCores: string[]) => {
        setConjuntoDeDados(dadosAtuais => ({ ...dadosAtuais, cores: novasCores }));
    };

    // --- ESTADOS DO INDICADOR ---
    const [tituloIndicador, setTituloIndicador] = useState("");
    const [descricaoIndicador, setDescricaoIndicador] = useState("");
    const [valorAtualIndicador, setValorAtualIndicador] = useState("");
    const [valorAlvoIndicador, setValorAlvoIndicador] = useState("");
    const [unidadeIndicador, setUnidadeIndicador] = useState("Nenhum");
    const [textoComparativoIndicador, setTextoComparativoIndicador] = useState("");
    const [corIndicador, setCorIndicador] = useState("#3B82F6");
    const [iconeIndicador, setIconeIndicador] = useState<NomeIcone>("Heart");

    const [previsualizacaoGerada, setPrevisualizacaoGerada] = useState(false);
    const [tipoVersao, setTipoVersao] = useState<TipoVersao>(TipoVersao.CORRECAO);
    const [descricaoVersao, setDescricaoVersao] = useState("");

    const reiniciarTodoOEstado = useCallback(() => {
        setTituloContexto(""); setDetalhesContexto(""); setArquivoContexto(null); setUrlContexto("");
        setIsNewVersionMode(false); setSelectedVersion("");
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
        setPrevisualizacaoGerada(false);
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

                setTituloContexto(dadosIniciais.title || "");
                setDetalhesContexto(dadosIniciais.description || "");
                
                setTituloGrafico(dadosIniciais.title || "");
                setDetalhesGrafico(dadosIniciais.description || "");
                setTipoGrafico(dadosIniciais.chartType || 'pie');
                
                if (dadosIniciais.payload) {
                    setConjuntoDeDados({
                        colunas: dadosIniciais.payload.colunas || ["Categoria", "Valor"],
                        linhas: dadosIniciais.payload.linhas || [],
                        cores: dadosIniciais.payload.cores || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
                        formatos: dadosIniciais.payload.formatos || [
                            'text' as FormatoColuna, 
                            ...(dadosIniciais.payload.colunas?.slice(1).map(() => 'number' as FormatoColuna) || ['number' as FormatoColuna]) // Resto como número
                        ],
                    });
                 setPrevisualizacaoGerada(true);
                }

                setTituloIndicador(dadosIniciais.title || "");
                setDescricaoIndicador(dadosIniciais.description || "");
                setValorAtualIndicador(dadosIniciais.valorAtual || "");
                setValorAlvoIndicador(dadosIniciais.valorAlvo || "");
                setUnidadeIndicador(dadosIniciais.unidade || "Nenhum");
                setTextoComparativoIndicador(dadosIniciais.textoComparativo || "");
                setCorIndicador(dadosIniciais.cor || "#3B82F6");
                setIconeIndicador(dadosIniciais.icone || "Heart");
            }
        }
    }, [estaAberto, dadosIniciais, abaInicial, reiniciarTodoOEstado]);


    const aoSubmeterFormulario = () => {
        let payload;
        const versionInfo = isNewVersionMode ? { type: tipoVersao, description: descricaoVersao, versionNumber: selectedVersion } : null;

        switch (abaAtiva) {
            case 'contexto':
                payload = { title: tituloContexto, details: detalhesContexto, file: arquivoContexto, url: urlContexto, versionInfo };
                aoSubmeter({ type: 'contexto', payload });
                showDispatchToast("Seu contexto foi enviado para aprovação do gerente.");
                break;

            case 'dashboard':
                payload = { title: tituloGrafico, details: detalhesGrafico, type: tipoGrafico, dataFile: arquivoDeDados, dataset: conjuntoDeDados, versionInfo };
                aoSubmeter({ type: 'dashboard', payload });
                showDispatchToast("Seu dashboard foi enviado para aprovação.");
                break;

            case 'indicador':
                payload = { titulo: tituloIndicador, descricao: descricaoIndicador, valorAtual: valorAtualIndicador, valorAlvo: valorAlvoIndicador, unidade: unidadeIndicador, textoComparativo: textoComparativoIndicador, cor: corIndicador, icone: iconeIndicador, versionInfo };
                aoSubmeter({ type: 'indicador', payload });
                showDispatchToast("Seu indicador foi enviado para aprovação.");
                break;
        }
        aoFechar();
    };
    
    const aoSelecionarArquivo = (arquivo: File | null) => {
        if (!arquivo) return;
        const LIMITE_TAMANHO_MB = 15;
        if (arquivo.size > LIMITE_TAMANHO_MB * 1024 * 1024) {
            showErrorToast("Arquivo muito grande", `O tamanho máximo é de ${LIMITE_TAMANHO_MB} MB.`);
            return;
        }
        setArquivoContexto(arquivo);
        setUrlContexto("");
    };

    const aoClicarBotaoUrl = () => {
        const url = prompt("Por favor, insira a URL:");
        if (url) { setUrlContexto(url); setArquivoContexto(null); }
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

    const adicionarLinha = () => {
        if (conjuntoDeDados.linhas.length >= 25) {
            showWarningToast("Limite de 25 linhas atingido.");
            return;
        }
        setConjuntoDeDados((d) => ({ ...d, linhas: [...d.linhas, Array(d.colunas.length).fill("")] }));
    };

    const removerLinha = (index: number) => setConjuntoDeDados((d) => ({ ...d, linhas: d.linhas.filter((_, i) => i !== index) }));

    const atualizarCelula = (linha: number, coluna: number, valor: string) => {
        if (coluna > 0) {
            if (valor.includes('-')) {
                showErrorToast("Valor inválido.", "Números negativos não são permitidos.");
                return;
            }
            const eNumerico = /^\d*\.?\d*$/.test(valor);
            if (!eNumerico && valor !== "") {
                showErrorToast("Valor inválido.", "Apenas números são permitidos nesta coluna.");
                return;
            }
        }
        setConjuntoDeDados((d) => ({ ...d, linhas: d.linhas.map((l, i) => i === linha ? l.map((c, j) => (j === coluna ? valor : c)) : l) }));
    };

   const adicionarColuna = () => {
        if (conjuntoDeDados.colunas.length >= 30) {
            showWarningToast("Limite de 30 colunas atingido.");
            return;
        }
        setConjuntoDeDados((d) => ({
            ...d,
            colunas: [...d.colunas, `Série ${d.colunas.length}`],
            linhas: d.linhas.map(linha => [...linha, ""]),
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

    const formatarTamanhoArquivo = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024; const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
    };

    const obterNomeFonteContexto = () => {
        if (arquivoContexto) return arquivoContexto.name;
        if (urlContexto) return urlContexto;
        return "Nenhum arquivo ou link selecionado";
    };

    const submissaoDesativada = (() => {
        switch (abaAtiva) {
            case 'contexto':
                if (isNewVersionMode) {
                    return !tipoVersao || !descricaoVersao.trim() || (!arquivoContexto && !urlContexto.trim());
                }
                return !tituloContexto.trim() || (!arquivoContexto && !urlContexto.trim());

            case 'dashboard':
                 if (isNewVersionMode) {
                    const dadosManuaisForamModificados = abaFonteDeDados === 'manual' && JSON.stringify(conjuntoDeDados) !== JSON.stringify(dadosIniciais?.payload);
                    const novoArquivoFoiEnviado = abaFonteDeDados === 'upload' && !!arquivoDeDados;
                    const dadosForamAlterados = dadosManuaisForamModificados || novoArquivoFoiEnviado;
                    
                    return !tipoVersao || !descricaoVersao.trim() || !dadosForamAlterados;
                }
                return !tituloGrafico.trim();

            case 'indicador':
                if (isNewVersionMode) {
                    return !tipoVersao || !descricaoVersao.trim() || !valorAtualIndicador.trim();
                }
                return !tituloIndicador.trim() || !valorAtualIndicador.trim();

            default:
                return true;
        }
    })();

    return {
        abaAtiva, setAbaAtiva, aoCancelar: aoFechar, aoSubmeter: aoSubmeterFormulario, submissaoDesativada,
        tituloContexto, setTituloContexto, detalhesContexto, setDetalhesContexto, arquivoContexto, setArquivoContexto,
        urlContexto, setUrlContexto, arrastandoSobre, aoSelecionarArquivo, aoClicarBotaoUrl, aoEntrarNaArea,
        aoSairDaArea, aoArrastarSobre, aoSoltarArquivo, obterNomeFonteContexto, formatarTamanhoArquivo,
        isNewVersionMode, selectedVersion, tipoVersao, setTipoVersao, descricaoVersao, setDescricaoVersao,
        abaFonteDeDados, setAbaFonteDeDados, tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo: aoMudarTipoGrafico, arquivoDeDados, setArquivoDeDados, atualizarFormatoColuna,
        conjuntoDeDados, definirCoresDoGrafico,
        adicionarLinha, removerLinha, atualizarCelula, adicionarColuna, removerColuna, atualizarNomeColuna,
        baixarModelo, previsualizacaoGerada, setPrevisualizacaoGerada,
        tituloIndicador, setTituloIndicador, descricaoIndicador, setDescricaoIndicador, valorAtualIndicador,
        setValorAtualIndicador, valorAlvoIndicador, setValorAlvoIndicador, unidadeIndicador, setUnidadeIndicador,
        textoComparativoIndicador, setTextoComparativoIndicador, corIndicador, setCorIndicador, iconeIndicador, setIconeIndicador,
    };
};