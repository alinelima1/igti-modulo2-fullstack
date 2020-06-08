import express from 'express';
import fs from 'fs';
import winston from 'winston';
import accountsRouter from '../routes/accounts.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../doc.js';
import cors from 'cors';

const app = express();
const writeFile = fs.promises.writeFile;
const readFile = fs.promises.readFile;

global.accountPath = './docs/accounts.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'my-bank-api.log' }),
  ],
  format: combine(label({ label: 'my-bank-api' }), timestamp(), myFormat),
});

app.use(express.json());
/* Quando a api estiver em um servidor e a página estiver em outra, 
pode ocorrer erros, o CORS é para "liberar" */
app.use(cors());
app.use('/account', accountsRouter);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, async () => {
  try {
    await readFile(accountPath, 'utf-8');
    logger.info('Aplicação executando na porta 3000.');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(accountPath, JSON.stringify(initialJson)).catch((err) => {
      logger.error(err);
    });
  }
});
