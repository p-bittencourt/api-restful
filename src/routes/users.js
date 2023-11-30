const express = require('express')
const router = express.Router()
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')

const usersFilePath = path.join(__dirname, '../data/users.json')

router.get('/', (req, res) => {
    const users = getUsers()
    res.json(users)
})

router.get('/:id', (req, res) => {
    const users = getUsers()
    const user = users.find((u) => u.id === req.params.id)

    if (user) {
        res.json(user)
    } else {
        res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }
})

router.post('/signup', async (req, res) => {
    try {
        const users = getUsers()

        // Verificar se o email já está cadastrado
        const existingUser = users.find((user) => user.email === req.body.email)
        if (existingUser) {
            return res.status(400).json({mensagem: 'Email já cadastrado'})
        }

        const senhaHased = await bcrypt.hash(req.body.senha, 10)

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

        users.push(newUser)
        saveUsers(users)

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h'})
        res.status(201).json({ 
            id: newUser.id,
            data_criacao: newUser.data_criacao,
            data_atualizacao: newUser.data_atualizacao,
            ultimo_login: newUser.ultimo_login,
            token
         })
    } catch (error) {
        console.error(error)
        res.status(500).json({mensagem: 'Erro interno do servidor.'})
    }
})

router.post('/signin', async(req, res) => {
    try {
        const users = getUsers()

        const user = users.find((u) => u.email === req.body.email)

        if (!user){
            return res.status(401).json({mensagem: "Usuário não encontrado"})
        }

        const verificarSenha = await bcrypt.compare(req.body.senha, user.senha)
        if (!verificarSenha) {
            return res.status(401).json({mensagem: "Senha incorreta."})
        }

        user.ultimo_login = new Date().toISOString()
        saveUsers(users)

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})

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