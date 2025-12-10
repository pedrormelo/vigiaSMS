// src/services/csvParserService.js

const MAX_ROWS = 25;
const MAX_COLS = 25;
const DANGEROUS_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Detecta delimitador (vírgula, ponto-e-vírgula, tab)
 */
function detectDelimiter(firstLine) {
    if (!firstLine) return ',';
    
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    
    // Retorna o delimitador mais frequente
    const counts = { ',': commaCount, ';': semicolonCount, '\t': tabCount };
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, ',');
}

/**
 * Sanitiza fórmulas perigosas em células
 */
function sanitizeCell(value) {
    if (typeof value !== 'string') return value;
    
    const trimmed = value.trim();
    if (DANGEROUS_PREFIXES.some(prefix => trimmed.startsWith(prefix))) {
        return trimmed.substring(1); // Remove primeiro caractere perigoso
    }
    return trimmed;
}

/**
 * Valida e tenta converter valor para número
 */
function parseValue(raw, colIndex) {
    if (colIndex === 0) {
        // Primeira coluna: sempre texto (categorias)
        return sanitizeCell(raw);
    }
    
    const sanitized = sanitizeCell(raw);
    if (!sanitized || sanitized === '') return null;
    
    // Tenta converter para número
    const cleaned = sanitized
        .replace(/[R$\s]/gi, '')
        .replace(/[^0-9,.-]/g, '');
    
    if (!cleaned) return null;
    
    let normalized = cleaned;
    const hasComma = normalized.includes(',');
    const hasDot = normalized.includes('.');
    
    if (hasComma && hasDot) {
        const lastComma = normalized.lastIndexOf(',');
        const lastDot = normalized.lastIndexOf('.');
        if (lastComma > lastDot) {
            normalized = normalized.replace(/\./g, '').replace(',', '.');
        } else {
            normalized = normalized.replace(/,/g, '');
        }
    } else if (hasComma) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
        normalized = normalized.replace(/,/g, '');
    }
    
    const num = parseFloat(normalized);
    return !isNaN(num) ? num : null;
}

/**
 * Parseia buffer CSV e retorna dataset estruturado
 * @param {Buffer} buffer - Conteúdo do arquivo CSV
 * @returns {Object} - { colunas, linhas, formatos, avisos }
 */
exports.parseCSV = (buffer) => {
    const avisos = [];
    
    try {
        const content = buffer.toString('utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length === 0) {
            throw new Error('Arquivo CSV vazio');
        }
        
        // Detecta delimitador pela primeira linha
        const delimiter = detectDelimiter(lines[0]);
        
        // Parse linhas
        const allRows = lines.map(line => {
            // Simples split pelo delimitador (não trata quotes avançadas)
            return line.split(delimiter).map(cell => cell.trim());
        });
        
        if (allRows.length === 0) {
            throw new Error('Nenhuma linha válida no arquivo');
        }
        
        const header = allRows[0];
        const dataRows = allRows.slice(1);
        
        // Validações
        if (header.length > MAX_COLS) {
            avisos.push(`⚠️ Arquivo tem ${header.length} colunas. Apenas as primeiras ${MAX_COLS} serão usadas.`);
        }
        
        if (dataRows.length > MAX_ROWS) {
            avisos.push(`⚠️ Arquivo tem ${dataRows.length} linhas. Apenas as primeiras ${MAX_ROWS} serão usadas.`);
        }
        
        // Limita colunas e linhas
        const colunas = header.slice(0, MAX_COLS);
        const linhas = dataRows
            .slice(0, MAX_ROWS)
            .map(row => {
                // Preenche com células vazias se linha tem menos colunas
                const cells = [];
                for (let i = 0; i < colunas.length; i++) {
                    const rawVal = row[i] || '';
                    cells.push(parseValue(rawVal, i));
                }
                return cells;
            });
        
        // Se primeira coluna está vazia ou nula, alerta
        const primeiraColVazia = linhas.some(linha => !linha[0]);
        if (primeiraColVazia) {
            avisos.push('⚠️ Algumas linhas têm a coluna de categorias vazia.');
        }
        
        // Remove linhas completamente vazias
        const linhasValidas = linhas.filter(linha => 
            linha.some(cell => cell !== null && cell !== '')
        );
        
        if (linhasValidas.length === 0) {
            throw new Error('Nenhuma linha com dados válida encontrada');
        }
        
        // Detecta formato das séries (segunda coluna em diante)
        const formatos = ['text'];
        for (let colIdx = 1; colIdx < colunas.length; colIdx++) {
            let temPercent = false;
            let temMoeda = false;
            let temNumero = false;
            
            for (const linha of linhasValidas) {
                const val = linha[colIdx];
                if (val === null) continue;
                
                const original = String(val);
                if (original.includes('%')) temPercent = true;
                if (original.includes('R$')) temMoeda = true;
                if (typeof val === 'number') temNumero = true;
            }
            
            if (temMoeda) formatos.push('currency');
            else if (temPercent) formatos.push('percent');
            else if (temNumero) formatos.push('number');
            else formatos.push('number');
        }
        
        return {
            colunas,
            linhas: linhasValidas,
            formatos,
            avisos,
            delimitador: delimiter,
            linhasOriginais: dataRows.length,
            colunasOriginais: header.length
        };
    } catch (error) {
        throw new Error(`Erro ao processar CSV: ${error.message}`);
    }
};

exports.MAX_ROWS = MAX_ROWS;
exports.MAX_COLS = MAX_COLS;
