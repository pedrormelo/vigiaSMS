const mysql = require("mysql2");
require("dotenv").config();

// Guard clause: if raw MySQL env vars are not provided, export a stub so the app doesn't crash.
const required = ["DB_HOST", "DB_USER", "DB_NAME"]; // password optional for local setups
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
    console.warn(
        `MySQL raw pool not initialized. Missing env vars: ${missing.join(", ")}. Skipping mysql2 pool creation.`
    );
    // Provide a minimal stub with a query method that rejects to indicate unavailable.
    module.exports = {
        query: async () => {
            throw new Error("MySQL pool not configured (missing env vars)");
        },
    };
} else {
    const db = mysql.createPool({
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4'
    });

    db.getConnection((err, connection) => {
        if (err) {
            console.error("Erro ao conectar ao banco de dados MySQL (raw):", err.message);
        } else {
            console.log("Raw MySQL pool conectado com sucesso.");
            connection.release();
        }
    });

    module.exports = db.promise();
}