// src/config/csvUploadConfig.js
const multer = require('multer');

const storage = multer.memoryStorage();

const allowedMimes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain'
];

const fileFilter = (req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    const isCsvExt = name.endsWith('.csv');
    if (allowedMimes.includes(file.mimetype) || isCsvExt) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos CSV são permitidos para esta operação.'));
    }
};

const uploadCsv = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = uploadCsv;
