const multer = require('multer');
const path = require('path');
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
    if (!file) return cb(null, true);
    if (allowed.has(file.mimetype)) return cb(null, true);
    cb(new Error('Tipo de arquivo não suportado.'), false);
};

module.exports = multer({ storage, fileFilter });
