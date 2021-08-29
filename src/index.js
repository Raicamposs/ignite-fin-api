const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(express.json());

app.listen(3333);