const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app.js')

chai.use(chaiHttp);
const expect = chai.expect;

describe("Endpoint de registro do usuário", () => {
    it ('deveria registrar um novo usuário e retornar a resposta no formato correto', async function() {
        const newUser = {
            nome: 'Fulano da Silva',
            email: 'fulano@email.com',
            senha: 'senha1234',
            telefones: [{ numero: '123456789', ddd: '11'}],
        }

        chai.request(app)
            .post('/users')
            .send(newUser)
            .end((err, res) => {
                expect(res).to.have.status(201)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('id')
                expect(res.body).to.have.property('data_criacao')
                expect(res.body).to.have.property('data_atualizacao')
                expect(res.body).to.have.property('ultimo_login')
                expect(res.body).to.have.property('token')
                done
            })
    })
})