import express from 'express';
import fs from 'fs';
import winston from 'winston';
import dataRouter from '../routes/data.js';

const app = express();
const writeFile = fs.promises.writeFile;
const readFile = fs.promises.readFile;

global.cidadesPath = './docs/Cidades.json';
global.estadosPath = './docs/Estados.json';

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
app.use('/data', dataRouter);

app.listen(3000, async () => {
  try {
    logger.info('Aplicação executando na porta 3000.');
  } catch (err) {
    logger.error(err.message);
  }
});
