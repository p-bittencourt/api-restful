// Pedro Monteiro Bittencourt
// Código desenvolvido para o Processo Avaliativo Escribo.com

// Importando os módulos necessários
const express = require('express')
const router = express.Router()
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')

// Configurando o local do arquivo .json
const usersFilePath = path.join(__dirname, '../data/users.json')
// Fazer o Get de todos os usuários
router.get('/', (req, res) => {
    const users = getUsers()
    res.json(users)
})
// Buscar o usuário por ID
router.get('/:id', (req, res) => {
    const users = getUsers()
    const user = users.find((u) => u.id === req.params.id)

    if (user) {
        res.json(user)
    } else {
        res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }
})
// Fazer o .post do cadastro do usuário
router.post('/signup', async (req, res) => {
    try { // Função assíncrona para usar o try catch e o bcrypt
        // Pega a lista de usuários cadastrados
        const users = getUsers()

        // Verificar se o email já está cadastrado
        const existingUser = users.find((user) => user.email === req.body.email)
        if (existingUser) {
            return res.status(400).json({mensagem: 'Email já cadastrado'})
        }
        // Faz o hash da senha
        const senhaHased = await bcrypt.hash(req.body.senha, 10)
        // Cria o usuário com as informações passadas, senha hash e as informações de output
        const newUser = {
            id: uuidv4(),
            nome: req.body.nome,
            email: req.body.email,
            senha: senhaHased,
            telefones: req.body.telefones || [],
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
            ultimo_login: new Date().toISOString(),
        }
        // Envia para o array de usuários e salva o json
        users.push(newUser)
        saveUsers(users)
        // Cria o token para enviar para o cliente e faz o retorno do .json
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h'})
        res.status(201).json({ 
            id: newUser.id,
            data_criacao: newUser.data_criacao,
            data_atualizacao: newUser.data_atualizacao,
            ultimo_login: newUser.ultimo_login,
            token
         })
    } catch (error) { // Pega os erros
        console.error(error)
        res.status(500).json({mensagem: 'Erro interno do servidor.'})
    }
})
// Faz o login do usuário
router.post('/signin', async(req, res) => {
    try {
        const users = getUsers()
        // Busca o usuário na lista de cadastros de acordo com o email.
        const user = users.find((u) => u.email === req.body.email)
        // Se não encontrar avisa o cliente
        if (!user){
            return res.status(401).json({mensagem: "Usuário não encontrado"})
        }
        // Caso encontrado o usuário, faz a comparação da senha enviada com a senha salva no sistema
        const verificarSenha = await bcrypt.compare(req.body.senha, user.senha)
        if (!verificarSenha) {
            return res.status(401).json({mensagem: "Senha incorreta."})
        }
        // Atualiza o último login e salva no .json
        user.ultimo_login = new Date().toISOString()
        saveUsers(users)
        // Cria o token do login
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})
        // Envia a resposta pedida para o cliente
        res.status(200).json({
            id: user.id,
            data_criacao: user.data_atualizacao,
            data_atualizacao: user.data_atualizacao,
            ultimo_login: user.ultimo_login,
            token,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({mensagem: "Erro interno do servidor."})
    }
})
// Faz a busca dos usuários de acordo com o Token
// Ainda estou desenvolvendo essa parte, para lidar com as mensagens de 'Usuário não encontrado'
router.get('/search', (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ mensagem: 'Não autorizado' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        const users = getUsers();
        const user = users.find(u => u.id === decoded.id);

        if (user) {
            user.ultimo_login = new Date().toISOString();
            saveUsers(users);

            res.json(user);
        } else {
            res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensagem: 'Sessão inválida' });
        }
        return res.status(401).json({ mensagem: 'Não autorizado' });
    }
});
// Funções auxiliares do trabalho
function getUsers(){
    try {
        const usersData = fs.readFileSync(usersFilePath)
        return JSON.parse(usersData)
    } catch (error) {
        return []
    }
}

function saveUsers(users){
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
}

module.exports = router