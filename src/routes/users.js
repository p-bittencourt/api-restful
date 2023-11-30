const express = require('express')
const router = express.Router()
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')

const usersFilePath = './data/users.json'

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

router.post('/', async (req, res) => {
    try {
        const users = getUsers()
        const senhaHased = await bcrypt.hash(req.body.senha, 10)

        const newUser = {
            id: uuidv4(),
            nome: req.body.nome,
            email: req.body.email,
            senha: senhaHased
        }

        users.push(newUser)
        saveUsers(users)

        res.status(201).json(newUser)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensagem: 'Erro interno do servidor.'})
    }
})

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