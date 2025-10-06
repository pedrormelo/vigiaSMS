import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { AbaAtiva, AbaFonteDeDados, TipoGrafico, ConjuntoDeDadosGrafico, ModalAdicionarConteudoProps } from "@/components/popups/addContextoModal/types";
import { showWarningToast, showErrorToast, showInfoToast } from "@/components/ui/Toasts";

export const useModalAdicionarConteudo = ({ estaAberto, aoFechar, aoSubmeter, abaInicial = 'contexto' }: ModalAdicionarConteudoProps) => {
    // --- ESTADO ---
    const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>(abaInicial);
    const [abaFonteDeDados, setAbaFonteDeDados] = useState<AbaFonteDeDados>('manual');
    const [arrastandoSobre, setArrastandoSobre] = useState(false);
    const [tituloContexto, setTituloContexto] = useState("");
    const [detalhesContexto, setDetalhesContexto] = useState("");
    const [arquivoContexto, setArquivoContexto] = useState<File | null>(null);
    const [urlContexto, setUrlContexto] = useState("");
    const [tituloGrafico, setTituloGrafico] = useState("");
    const [detalhesGrafico, setDetalhesGrafico] = useState("");
    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("pie");
    const [arquivoDeDados, setArquivoDeDados] = useState<File | null>(null);
    const [conjuntoDeDados, setConjuntoDeDados] = useState<ConjuntoDeDadosGrafico>({
        colunas: ["Categoria", "Valor"],
        linhas: [["Exemplo de Categoria", 100]],
    });

    // --- FUNÇÕES E EFEITOS ---
    
    const reiniciarTodoOEstado = () => {
        setTituloContexto(""); setDetalhesContexto(""); setArquivoContexto(null); setUrlContexto("");
        setTituloGrafico(""); setDetalhesGrafico(""); setTipoGrafico("pie");
        setArquivoDeDados(null);
        setConjuntoDeDados({
            colunas: ["Categoria", "Valor"],
            linhas: [["Exemplo de Categoria", 100]],
        });
        setAbaAtiva(abaInicial);
        setAbaFonteDeDados('manual');
    };

    useEffect(() => {
        if (estaAberto) {
            setAbaAtiva(abaInicial);
        } else {
            setTimeout(reiniciarTodoOEstado, 200);
        }
    }, [estaAberto, abaInicial]);

    const aoSubmeterFormulario = () => {
        if (abaAtiva === 'contexto') {
            aoSubmeter({ type: 'contexto', payload: { title: tituloContexto, details: detalhesContexto, file: arquivoContexto, url: urlContexto } });
        } else {
            aoSubmeter({ type: 'dashboard', payload: { title: tituloGrafico, details: detalhesGrafico, type: tipoGrafico, dataFile: arquivoDeDados, dataset: conjuntoDeDados } });
        }
        aoFechar();
    };
    
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

        const modelos = {
            pie: { colunas: ["Categoria", "Valor"], linhasPadrao: [["", ""]] },
            chart: { colunas: ["Grupo", "Valor 1", "Valor 2"], linhasPadrao: [["", "", ""]] },
            line: { colunas: ["Eixo X", "Linha A", "Linha B"], linhasPadrao: [["", "", ""]] },
        };

        setConjuntoDeDados(dadosAtuais => {
            const { colunas: colunasAtuais, linhas: linhasAtuais } = dadosAtuais;
            const alvo = modelos[t];
            
            let novasColunas = alvo.colunas.slice(0, colunasAtuais.length);
            for(let i=0; i<colunasAtuais.length; i++){
                novasColunas[i] = colunasAtuais[i];
            }

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
            showErrorToast("Ação não permitida", "A coluna de categorias não pode ser removida.");
            return;
        }
        if (conjuntoDeDados.colunas.length <= 2) {
            showErrorToast("Ação não permitida", "O gráfico precisa de pelo menos uma coluna de valores.");
            return;
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
        const k = 1024;
        const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
    };

    const obterNomeFonteContexto = () => {
        if (arquivoContexto) return arquivoContexto.name;
        if (urlContexto) return urlContexto;
        return "Nenhum arquivo ou link selecionado";
    };

    const submissaoDesativada = abaAtiva === 'contexto' ? !tituloContexto.trim() : !tituloGrafico.trim();

    return {
        abaAtiva, setAbaAtiva, abaFonteDeDados, setAbaFonteDeDados, arrastandoSobre,
        tituloContexto, setTituloContexto, detalhesContexto, setDetalhesContexto,
        arquivoContexto, setArquivoContexto, urlContexto, setUrlContexto,
        tituloGrafico, setTituloGrafico, detalhesGrafico, setDetalhesGrafico,
        tipoGrafico, arquivoDeDados, setArquivoDeDados, conjuntoDeDados,
        aoCancelar: aoFechar, aoSubmeter: aoSubmeterFormulario, aoSelecionarArquivo, aoClicarBotaoUrl,
        aoEntrarNaArea, aoSairDaArea, aoArrastarSobre, aoSoltarArquivo,
        aoMudarTipo: aoMudarTipoGrafico, adicionarLinha, removerLinha, atualizarCelula, adicionarColuna,
        removerColuna, atualizarNomeColuna, baixarModelo,
        submissaoDesativada, formatarTamanhoArquivo, obterNomeFonteContexto,
    };
};