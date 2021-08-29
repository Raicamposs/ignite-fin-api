const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(express.json());

const costumers = [];


function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const [costumer] = costumers.filter(costumer => costumer.cpf === cpf);

  if (!costumer) {
    return response.status(400).json({ error: 'Costumer not found' })
  }

  request.costumer = costumer;
  return next();
}

app.post('/account', (request, response) => {
  const { cpf = '', name } = request.body;
  const cpfWithoutMask = cpf.replaceAll('.', '').replaceAll('-', '');

  const costumerAlreadyExist = costumers.some(costumer => costumer.cpf === cpfWithoutMask);

  if (costumerAlreadyExist) {
    return response.status(400).json({ error: 'Costumer already exists!' })
  }

  costumers.push({ id: uuidV4(), name, cpf: cpfWithoutMask, statement: [] });
  return response.status(201).send();
});


app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { costumer } = request;
  return response.json(costumer.statement);
});

app.listen(3333);