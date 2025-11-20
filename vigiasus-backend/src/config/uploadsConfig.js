// src/config/uploadsConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ALTERAÇÃO: Define uma pasta temporária na raiz do projeto (fora de src/files)
// O arquivo fica aqui apenas enquanto o registro do banco não é criado.
const tempFolder = path.resolve(__dirname, '../../temp_uploads');

// Garante que a pasta temporária existe
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Salva na pasta temporária.
        // O Controller chamará o 'fileStorageService' para mover isto para o destino final.
        cb(null, tempFolder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = crypto.randomUUID(); 
        cb(null, `${uniqueName}${ext}`);
    }
});

const allowedMimes = [
    // PDF
    "application/pdf",
    
    // Word
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    
    // Excel / Dados (Importante para Dashboards)
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // .csv
    "application/csv", // .csv (variação)
    
    // PowerPoint
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
];

const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de arquivo não suportado. Permitidos: PDF, Word, Excel, CSV e PowerPoint."), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

module.exports = upload;