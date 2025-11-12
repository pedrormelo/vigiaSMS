const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Inicializa o Prisma Client
const prisma = new PrismaClient();
const router = express.Router();

/**
 * Rota de Login (Autenticação)
 * POST /auth/login
 */
router.post('/login', async (req, res) => {
    // 1. Pega o email e a senha do corpo da requisição
    const { email, password } = req.body;

    // Validação simples
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // 2. Procura o usuário no banco de dados pelo email
        //
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        // 3. Se o usuário não for encontrado...
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // 4. Compara a senha fornecida com o hash armazenado no banco
        //
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        // 5. Se a senha estiver incorreta...
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        // 6. Se a senha estiver correta, cria o "Payload" do token
        // O payload são os dados que queremos armazenar dentro do token
        //
        const payload = {
            id: user.id,
            nome: user.nome,
            role: user.role,
            gerenciaId: user.gerenciaId,
            diretoriaId: user.diretoriaId
        };

        // 7. Gera o token JWT
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Nosso segredo do .env
            { expiresIn: '8h' } // Define a validade do token (8 horas)
        );

        // 8. Envia o token e os dados do usuário (sem a senha) como resposta
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            user: payload // Envia os dados do usuário para o frontend
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

/* * NOTA: Vamos também precisará de uma rota /register para criar usuários
 * e hashear a senha com bcrypt.hash() antes de salvar.
 * Podemos fazer isso a seguir, se desejar.
 */

module.exports = router;