// Pedro Monteiro Bittencourt
// Código desenvolvido para o Processo Avaliativo Escribo.com

// Importando os módulos necessários
const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const usersRouter = require('./routes/users')

// Configurando o ambiente, o express e a porta 
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// Configurando o parser do json
app.use(bodyParser.json())
// Montando o router para lidar com as operações do usuário
app.use(usersRouter)
// Lidando com requests para endpoints que não existem
app.use((req, res) => {
    res.status(404).json({ mensagem: 'Endpoint não encontrado.'})
})
// Lidando com erros internos e logando no console;
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});
// Iniciando o servidor na porta correta
app.listen(PORT, () => {
    console.log(`Servidor executando em http://localhost:${PORT}`)
})
// Exportando o app para os testes
module.exports = app