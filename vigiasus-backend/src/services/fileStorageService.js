// src/services/fileStorageService.js
const fs = require('fs');
const path = require('path');

// Função auxiliar para limpar nomes de pastas/arquivos
function sanitizeName(name) {
    if (!name) return 'sem_titulo';
    return name
        .normalize('NFD') // Separa acentos
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-zA-Z0-9\-_]/g, "_") // Substitui símbolos por underline
        .replace(/_+/g, "_") // Evita underlines duplos
        .toLowerCase();
}

/**
 * Move e renomeia o arquivo para uma estrutura organizada e legível.
 * NOVA Estrutura: files/{gerenciaSlug}/{Titulo_Contexto}_{ID_Curto}/{filename}
 * (Sem separação por Ano/Mês para manter versões juntas)
 */
exports.moveFileToFinalDestination = async (file, gerenciaSlug, contextoId, tituloContexto, versaoNumero) => {
    if (!file) return null;

    // Define caminho base: src/files
    const baseDir = path.resolve(__dirname, '../files');
    
    // 1. Preparar nomes
    const safeSlug = sanitizeName(gerenciaSlug || 'geral');
    const safeTitle = sanitizeName(tituloContexto);
    const shortId = contextoId.substring(0, 8); // Primeiros 8 chars do UUID
    
    // Nome da Pasta do Contexto: "titulo_id"
    const contextFolderName = `${safeTitle}_${shortId}`;

    // 2. Define caminho relativo (Sem Ano/Mês)
    // Ex: files/gerencia-ti/relatorio-anual_a1b2c3d4/
    const relativeDir = path.join(safeSlug, contextFolderName);
    const absoluteDir = path.join(baseDir, relativeDir);

    // 3. Criar estrutura de pastas se não existir
    if (!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir, { recursive: true });
    }

    // 4. Preparar nome do arquivo: "v1_titulo.pdf"
    const ext = path.extname(file.originalname);
    const newFilename = `v${versaoNumero}_${safeTitle}${ext}`;

    const oldPath = file.path;
    const newPath = path.join(absoluteDir, newFilename);

    // 5. Mover o arquivo
    try {
        await fs.promises.rename(oldPath, newPath);
    } catch (error) {
        // Fallback para partições diferentes
        await fs.promises.copyFile(oldPath, newPath);
        await fs.promises.unlink(oldPath);
    }

    // Retorna caminho relativo para o banco (URL web)
    // Normaliza barras para formato URL (/)
    const webPath = path.join('/files', relativeDir, newFilename).replace(/\\/g, '/');
    
    return webPath;
};

exports.softDeleteFile = (currentPath, gerenciaSlug) => {
    if (!currentPath) return null;

    // Caminho base do seu storage (ajuste conforme sua configuração real)
    // Supondo que 'source/files' seja a raiz
    const storageRoot = path.resolve(__dirname, '..', 'files'); 
    const fullCurrentPath = path.join(storageRoot, currentPath.replace(/^\/files\//, '')); // Ajuste para caminho absoluto

    if (!fs.existsSync(fullCurrentPath)) {
        console.warn(`Arquivo não encontrado para mover: ${fullCurrentPath}`);
        return null;
    }

    // Cria pasta de destino: source/files/apagados/slug-da-gerencia
    const trashDir = path.join(storageRoot, 'apagados', gerenciaSlug);
    
    if (!fs.existsSync(trashDir)) {
        fs.mkdirSync(trashDir, { recursive: true });
    }

    const fileName = path.basename(fullCurrentPath);
    // Adiciona timestamp para evitar conflito de nomes
    const newFileName = `${Date.now()}_${fileName}`;
    const destinationPath = path.join(trashDir, newFileName);

    try {
        // Move o arquivo
        fs.renameSync(fullCurrentPath, destinationPath);
        // Retorna o novo caminho relativo para (opcionalmente) salvar no log ou apenas confirmar
        return `/files/apagados/${gerenciaSlug}/${newFileName}`;
    } catch (err) {
        console.error('Erro ao mover arquivo para lixeira:', err);
        throw new Error('Falha ao mover arquivo para a lixeira.');
    }
};