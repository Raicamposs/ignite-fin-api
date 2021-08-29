const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(express.json());

const costumers = [];

app.post('/account', (request, response) => {
  const { cpf = '', name } = request.body;
  const cpfWithoutMask = cpf.replace('.', '').replace('-', '');

  const costumerAlreadyExist = costumers.some(costumer => costumer.cpf === cpfWithoutMask);

  if (costumerAlreadyExist) {
    return response.status(400).json({ error: 'Costumer already exists!' })
  }

  costumers.push({ id: uuidV4(), name, cpf: cpfWithoutMask, statement: [] });
  return response.status(201).send();
});

app.listen(3333);