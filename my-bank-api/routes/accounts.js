import express from 'express';
import fs from 'fs';

const writeFile = fs.promises.writeFile;
const readFile = fs.promises.readFile;

const router = express.Router();

router.post('/', async (req, res) => {
  let account = req.body;
  try {
    let data = await readFile(accountPath, 'utf-8');
    let json = JSON.parse(data);
    account = { id: json.nextId++, ...account };
    json.accounts.push(account);

    await writeFile(accountPath, JSON.stringify(json));

    res.end();

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.info(`POST /account - ${err.message}`);
  }
});

router.get('/', async (_, res) => {
  try {
    let data = await readFile(accountPath, 'utf-8');
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);
    logger.info(`GET /account - ${JSON.stringify(json)}`);
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(`get /account - ${err.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let data = await readFile(accountPath, 'utf-8');
    let json = JSON.parse(data);
    let account = json.accounts.find(
      (account) => account.id === parseInt(req.params.id)
    );
    if (account) {
      res.send(account);
      logger.info(`GET /account/:id  - ${account}`);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(`GET /account/:id - ${err.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let data = await readFile(accountPath, 'utf-8');

    let json = JSON.parse(data);
    let accounts = json.accounts.filter(
      (account) => account.id !== parseInt(req.params.id, 10)
    );
    json.accounts = accounts;

    await writeFile(accountPath, JSON.stringify(json));

    logger.info(`DELETE /account`);
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(`DELETE /account - ${err.message}`);
  }
});

router.put('/', async (req, res) => {
  let newAccount = req.body;
  try {
    let data = await readFile(accountPath, 'utf-8');

    let json = JSON.parse(data);
    let oldIndex = json.accounts.findIndex(
      (account) => account.id === newAccount.id
    );
    json.accounts[oldIndex] = newAccount;

    await writeFile(accountPath, JSON.stringify(json));

    logger.info(`PUT /account - ${JSON.stringify(json)}`);
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(`put /account - ${err.message}`);
  }
});

router.post('/deposit', async (req, res) => {
  let params = req.body;
  try {
    let data = await readFile(accountPath, 'utf-8');

    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id === params.id);
    json.accounts[index].balance += params.value;

    await writeFile(accountPath, JSON.stringify(json));

    logger.info(`POST /account/deposit - ${JSON.stringify(json)}`);
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(`POST /account/deposit - ${err.message}`);
  }
});

router.post('/transaction', async (req, res) => {
  let params = req.body;
  try {
    let data = await readFile(accountPath, 'utf-8');

    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id === params.id);

    if (params.value < 0 && json.accounts[index].balance - params.value < 0) {
      throw new Error('Não há saldo suficiente!');
    }
    json.accounts[index].balance += params.value;

    await writeFile(accountPath, JSON.stringify(json));

    logger.info(`POST /account/transaction - ${JSON.stringify(json)}`);
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(`POST /account/transaction - ${err.message}`);
  }
});

export default router;
