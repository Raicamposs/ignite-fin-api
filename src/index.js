const express = require('express');
var cors = require('cors');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

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


function getBalance(statement) {
  return statement.reduce((acc, operation) => {
    if (operation.type === 'credit')
      return acc + operation.amount;
    return acc - operation.amount;
  }, 0);
}


app.get('/', (_, response) => {
  return response.send('FinAPI is running');

});

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
  const { date } = request.query;

  if (!date) {
    return response.json(costumer.statement);
  }

  const dateFormat = new Date(date + ' 00:00');
  const statement = costumer.statement.filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

  return response.json(statement);

});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { costumer } = request;
  const { amount, description } = request.body;

  const statementOperation = {
    amount,
    description,
    created_at: new Date(),
    type: 'credit'
  };

  costumer.statement.push(statementOperation);
  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { costumer } = request;
  const { amount } = request.body;

  const balance = getBalance(costumer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient funds!' })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  };

  costumer.statement.push(statementOperation);
  return response.status(201).send();
});

app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { costumer } = request;

  costumer.name = name;

  return response.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { costumer } = request;
  return response.json({ ...costumer, balance: getBalance(costumer.statement) });
});

app.get('/balance', verifyIfExistsAccountCPF, (request, response) => {
  const { costumer } = request;
  return response.json(getBalance(costumer.statement));
});

app.get('/delete', verifyIfExistsAccountCPF, (request, response) => {
  const { costumer } = request;
  costumers.splice(costumer, 1);
  return response.status(204).send();
});

app.listen(process.env.PORT || 3333);