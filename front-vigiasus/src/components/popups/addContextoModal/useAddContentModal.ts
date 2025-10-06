import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
// MUDANÇA: Importamos o novo tipo 'NomeIcone'
import { AbaAtiva, AbaFonteDeDados, TipoGrafico, ConjuntoDeDadosGrafico, ModalAdicionarConteudoProps, NomeIcone } from "./types";
import { showWarningToast, showErrorToast, showInfoToast } from "@/components/ui/Toasts";

export const useModalAdicionarConteudo = ({ estaAberto, aoFechar, aoSubmeter, abaInicial = 'contexto' }: ModalAdicionarConteudoProps) => {
    // --- ESTADOS ---
    const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>(abaInicial);
    const [abaFonteDeDados, setAbaFonteDeDados] = useState<AbaFonteDeDados>('manual');
    const [arrastandoSobre, setArrastandoSobre] = useState(false);
    
    // Estados do Contexto
    const [tituloContexto, setTituloContexto] = useState("");
    const [detalhesContexto, setDetalhesContexto] = useState("");
    const [arquivoContexto, setArquivoContexto] = useState<File | null>(null);
    const [urlContexto, setUrlContexto] = useState("");
    
    // Estados do Dashboard
    const [tituloGrafico, setTituloGrafico] = useState("");
    const [detalhesGrafico, setDetalhesGrafico] = useState("");
    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("pie");
    const [arquivoDeDados, setArquivoDeDados] = useState<File | null>(null);
    const [conjuntoDeDados, setConjuntoDeDados] = useState<ConjuntoDeDadosGrafico>({
        colunas: ["Categoria", "Valor"],
        linhas: [["Exemplo de Categoria", 100]],
    });

    // Estados do Indicador
    const [tituloIndicador, setTituloIndicador] = useState("");
    const [descricaoIndicador, setDescricaoIndicador] = useState("");
    const [valorAtualIndicador, setValorAtualIndicador] = useState("");
    const [valorAlvoIndicador, setValorAlvoIndicador] = useState("");
    const [unidadeIndicador, setUnidadeIndicador] = useState("Nenhum");
    const [textoComparativoIndicador, setTextoComparativoIndicador] = useState("");
    const [corIndicador, setCorIndicador] = useState("#3B82F6");
    // MUDANÇA: Adicionado o estado para o ícone
    const [iconeIndicador, setIconeIndicador] = useState<NomeIcone>("Heart");


    const reiniciarTodoOEstado = () => {
        setTituloContexto(""); setDetalhesContexto(""); setArquivoContexto(null); setUrlContexto("");
        setTituloGrafico(""); setDetalhesGrafico(""); setTipoGrafico("pie");
        setArquivoDeDados(null);
        setConjuntoDeDados({ colunas: ["Categoria", "Valor"], linhas: [["Exemplo de Categoria", 100]], });
        
        // MUDANÇA: Adicionado o reset para os estados do indicador, incluindo o ícone
        setTituloIndicador("");
        setDescricaoIndicador("");
        setValorAtualIndicador("");
        setValorAlvoIndicador("");
        setUnidadeIndicador("Nenhum");
        setTextoComparativoIndicador("");
        setCorIndicador("#3B82F6");
        setIconeIndicador("Heart");

        setAbaAtiva(abaInicial); 
        setAbaFonteDeDados('manual');
    };

    useEffect(() => {
        if (estaAberto) { setAbaAtiva(abaInicial); } 
        else { setTimeout(reiniciarTodoOEstado, 200); }
    }, [estaAberto, abaInicial]);

    const aoSubmeterFormulario = () => {
        if (abaAtiva === 'contexto') {
            aoSubmeter({ type: 'contexto', payload: { title: tituloContexto, details: detalhesContexto, file: arquivoContexto, url: urlContexto } });
        } else if (abaAtiva === 'dashboard') {
            aoSubmeter({ type: 'dashboard', payload: { title: tituloGrafico, details: detalhesGrafico, type: tipoGrafico, dataFile: arquivoDeDados, dataset: conjuntoDeDados } });
        } else if (abaAtiva === 'indicador') {
            // MUDANÇA: Adicionado 'icone' ao payload da submissão
            aoSubmeter({ type: 'indicador', payload: { titulo: tituloIndicador, descricao: descricaoIndicador, valorAtual: valorAtualIndicador, valorAlvo: valorAlvoIndicador, unidade: unidadeIndicador, textoComparativo: textoComparativoIndicador, cor: corIndicador, icone: iconeIndicador } });
        }
        aoFechar();
    };
    
    // ... (restante do ficheiro, como as funções de arrastar e largar, não precisa de alterações)
    const aoSelecionarArquivo = (arquivo: File | null) => {
        if (arquivo) { setArquivoContexto(arquivo); setUrlContexto(""); }
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
        const modelos = { pie: { colunas: ["Categoria", "Valor"], linhasPadrao: [["", ""]] }, chart: { colunas: ["Grupo", "Valor 1", "Valor 2"], linhasPadrao: [["", "", ""]] }, line: { colunas: ["Eixo X", "Linha A", "Linha B"], linhasPadrao: [["", "", ""]] }, };
        setConjuntoDeDados(dadosAtuais => {
            const { colunas: colunasAtuais, linhas: linhasAtuais } = dadosAtuais;
            const alvo = modelos[t];
            let novasColunas = alvo.colunas.slice(0, colunasAtuais.length);
            for(let i=0; i<colunasAtuais.length; i++){ novasColunas[i] = colunasAtuais[i]; }
            let novasLinhas = linhasAtuais.map(linha => linha.slice(0, alvo.colunas.length));
            const diff = alvo.colunas.length - novasColunas.length;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    novasColunas.push(alvo.colunas[novasColunas.length]);
                    novasLinhas.forEach(linha => linha.push(""));
                }
                showInfoToast("Tabela ajustada", "Novas colunas foram adicionadas para este tipo de gráfico.");
            } else if (diff < 0) {
                novasColunas = novasColunas.slice(0, alvo.colunas.length);
                novasLinhas = novasLinhas.map(linha => linha.slice(0, alvo.colunas.length));
                showInfoToast("Tabela ajustada", "Colunas extras foram removidas para este tipo de gráfico.");
            }
            return { colunas: novasColunas, linhas: novasLinhas.length > 0 ? novasLinhas : alvo.linhasPadrao };
        });
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
        setConjuntoDeDados((d) => ({ ...d, colunas: [...d.colunas, `Série ${d.colunas.length}`], linhas: d.linhas.map(linha => [...linha, ""]) }));
    };

    const removerColuna = (indiceColuna: number) => {
        if (indiceColuna === 0) {
            showErrorToast("Ação não permitida", "A coluna de categorias não pode ser removida."); return;
        }
        if (conjuntoDeDados.colunas.length <= 2) {
            showErrorToast("Ação não permitida", "O gráfico precisa de pelo menos uma coluna de valores."); return;
        }
        setConjuntoDeDados((d) => ({ colunas: d.colunas.filter((_, i) => i !== indiceColuna), linhas: d.linhas.map(linha => linha.filter((_, i) => i !== indiceColuna)) }));
    };

    const atualizarNomeColuna = (index: number, novoNome: string) => setConjuntoDeDados((d) => ({ ...d, colunas: d.colunas.map((col, i) => (i === index ? novoNome : col)) }));

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
        switch(abaAtiva) {
            case 'contexto': return !tituloContexto.trim();
            case 'dashboard': return !tituloGrafico.trim();
            case 'indicador': return !tituloIndicador.trim() || !valorAtualIndicador.trim();
            default: return true;
        }
    })();
    
    // MUDANÇA: Adicionadas as propriedades do ícone ao objeto de retorno
    return {
        // Gerais
        abaAtiva, setAbaAtiva,
        aoCancelar: aoFechar,
        aoSubmeter: aoSubmeterFormulario,
        submissaoDesativada,
        
        // Aba de Contexto
        tituloContexto, setTituloContexto,
        detalhesContexto, setDetalhesContexto,
        arquivoContexto, setArquivoContexto,
        urlContexto, setUrlContexto,
        arrastandoSobre,
        aoSelecionarArquivo, aoClicarBotaoUrl,
        aoEntrarNaArea, aoSairDaArea, aoArrastarSobre, aoSoltarArquivo,
        obterNomeFonteContexto, formatarTamanhoArquivo,

        // Aba de Dashboard
        abaFonteDeDados, setAbaFonteDeDados,
        tituloGrafico, setTituloGrafico,
        detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, aoMudarTipo: aoMudarTipoGrafico,
        arquivoDeDados, setArquivoDeDados,
        conjuntoDeDados,
        adicionarLinha, removerLinha, atualizarCelula,
        adicionarColuna, removerColuna, atualizarNomeColuna,
        baixarModelo,

        // Aba de Indicador
        tituloIndicador, setTituloIndicador,
        descricaoIndicador, setDescricaoIndicador,
        valorAtualIndicador, setValorAtualIndicador,
        valorAlvoIndicador, setValorAlvoIndicador,
        unidadeIndicador, setUnidadeIndicador,
        textoComparativoIndicador, setTextoComparativoIndicador,
        corIndicador, setCorIndicador,
        iconeIndicador, setIconeIndicador,
    };
};