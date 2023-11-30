const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const usersRouter = require('./routes/users')

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

app.use('/users', usersRouter)

app.use((req, res) => {
    res.status(404).json({ mensagem: 'Endpoint não encontrado.'})
})

app.listen(PORT, () => {
    console.log(`Servidor executando em https://localhost:${PORT}`)
})