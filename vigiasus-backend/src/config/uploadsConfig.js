const multer = require('multer');
const path = require('path');
<<<<<<< HEAD
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "files/context/"); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = crypto.randomUUID(); 
        cb(null, `${uniqueName}${ext}`);
=======
const fs = require('fs');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save per-gerência under src/files/uploads/<gerenciaId>
        const gerenciaId = (req.user && req.user.gerenciaId) ? req.user.gerenciaId : 'misc';
        const dest = path.resolve(__dirname, '..', 'files', 'uploads', gerenciaId);
        try { ensureDir(dest); } catch {}
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9-_\.]+/g, '_')
            .slice(0, 60);
        const name = `${Date.now()}_${base}${ext}`;
        cb(null, name);
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
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
<<<<<<< HEAD
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
=======
    if (!file) return cb(null, true);
    if (allowed.has(file.mimetype)) return cb(null, true);
    cb(new Error('Tipo de arquivo não suportado.'), false);
};

module.exports = multer({ storage, fileFilter });
>>>>>>> f444dbd42689cdbf09ed78a6f30dbf1b4cf8a836
