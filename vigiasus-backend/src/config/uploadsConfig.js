const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "files/context/"); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = crypto.randomUUID(); 
        cb(null, `${uniqueName}${ext}`);
    }
});

const allowed = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const fileFilter = (req, file, cb) => {
    // Lista exaustiva de tipos permitidos
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

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de arquivo não suportado. Permitidos: PDF, Word, Excel, CSV e PowerPoint."), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // Aumentei para 25MB (PPTs podem ser grandes)
});

module.exports = upload;
