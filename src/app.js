const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const usersRouter = require('./routes/users')

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

app.use('/signup', usersRouter)

app.use((req, res) => {
    res.status(404).json({ mensagem: 'Endpoint não encontrado.'})
})

app.listen(PORT, () => {
    console.log(`Servidor executando em http://localhost:${PORT}`)
})

module.exports = app