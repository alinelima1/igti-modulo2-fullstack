import express from 'express';
import fs from 'fs';

const writeFile = fs.promises.writeFile;
const readFile = fs.promises.readFile;

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let dataEstados = await readFile(estadosPath, 'utf-8');
    let dataCidades = await readFile(cidadesPath, 'utf-8');
    let jsonEstados = JSON.parse(dataEstados);
    let jsonCidades = JSON.parse(dataCidades);
    let arrayEstado = [];
    jsonEstados.forEach((estado) => {
      arrayEstado = [];
      jsonCidades.forEach((cidade) => {
        if (cidade.Estado === estado.ID) {
          arrayEstado.push(cidade);
        }
      });
      logger.info(`Criando arquivo ${estado.Sigla}.json`);
      writeFile(
        `./json/${estado.Sigla}.json`,
        JSON.stringify(arrayEstado)
      ).catch((err) => {
        logger.error(err);
      });
    });
    res.send('Arquivos criados.');
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(err.message);
  }
});

router.get('/:state', async (req, res) => {
  try {
    let arquivoEstado = await readFile(
      `./json/${req.params.state}.json`,
      'utf-8'
    );
    let jsonEstadoSelecionado = JSON.parse(arquivoEstado);
    res.send(`${jsonEstadoSelecionado.length}`);
    logger.info(`Este arquivo contem ${jsonEstadoSelecionado.length} cidades.`);
    geraVetorTotaisCidades();
  } catch (err) {
    res.status(400).send({ err: err.message });
    logger.error(err.message);
  }
});

const geraVetorTotaisCidades = async () => {
  try {
    let dataEstados = await readFile(estadosPath, 'utf-8');
    let dataCidades = await readFile(cidadesPath, 'utf-8');
    let jsonEstados = JSON.parse(dataEstados);
    let jsonCidades = JSON.parse(dataCidades);
    let arrayEstado = [];
    let count = 0;
    jsonEstados.forEach((estado) => {
      count = 0;
      jsonCidades.forEach((cidade) => {
        if (cidade.Estado === estado.ID) {
          count += 1;
        }
      });
      arrayEstado.push({ Sigla: estado.Sigla, Quantidade: count });
    });
    logger.info(`Vetor criado com totais`);
    maiores(arrayEstado);
    menores(arrayEstado);
    maioresNomes(jsonEstados, jsonCidades);
    menoresNomes(jsonEstados, jsonCidades);
    maiorCidade(jsonCidades, jsonEstados);
    menorCidade(jsonCidades, jsonEstados);
  } catch (err) {
    logger.error(err.message);
  }
};

const maiores = (arrayEstado) => {
  let maiores = [];
  arrayEstado.sort((a, b) => b.Quantidade - a.Quantidade);
  for (var i = 0; i < 5; i++) {
    maiores.push(`${arrayEstado[i].Sigla} - ${arrayEstado[i].Quantidade}`);
  }
  console.log('*****Maiores*****');
  console.log(maiores);
};

const menores = (arrayEstado) => {
  let menores = [];
  arrayEstado.sort((a, b) => a.Quantidade - b.Quantidade);
  for (var i = 0; i < 5; i++) {
    menores.push(`${arrayEstado[i].Sigla} - ${arrayEstado[i].Quantidade}`);
  }
  console.log('*****Menores*****');
  console.log(menores);
};

const maioresNomes = (estados, cidades) => {
  let maioresNomes = [];
  estados.forEach((estado) => {
    let maior = '';
    cidades.forEach((cidade) => {
      if (cidade.Estado == estado.ID) {
        if (cidade.Nome.length === maior.length) {
          maior = maior < cidade.Nome ? maior : cidade.Nome;
        } else if (cidade.Nome.length > maior.length) {
          maior = cidade.Nome;
        }
      }
    });
    maioresNomes.push(`${maior} - ${estado.Sigla}`);
  });
  console.log('*****Maiores nomes de cidades*****');
  console.log(maioresNomes);
};

const menoresNomes = (estados, cidades) => {
  let menoresNomes = [];
  estados.forEach((estado) => {
    let menor = '';
    cidades.forEach((cidade) => {
      if (cidade.Estado == estado.ID) {
        if (menor == '') {
          menor = cidade.Nome;
        }

        if (cidade.Nome.length === menor.length) {
          menor = menor > cidade.Nome ? menor : cidade.Nome;
        } else if (cidade.Nome.length < menor.length) {
          menor = cidade.Nome;
        }
      }
    });
    menoresNomes.push(`${menor} - ${estado.Sigla}`);
  });
  console.log('*****Menores nomes de cidades*****');
  console.log(menoresNomes);
};

const maiorCidade = (cidades, estados) => {
  let maior = '';
  let estado = '';
  cidades.forEach((cidade) => {
    if (cidade.Nome.length === maior.length) {
      maior = maior < cidade.Nome ? maior : cidade.Nome;
      estado = cidade.Estado;
    } else if (cidade.Nome.length > maior.length) {
      maior = cidade.Nome;
      estado = cidade.Estado;
    }
  });

  let estadoFinal = estados.find((e) => e.ID == estado).Sigla;
  console.log('*****Maior nome de todos.*****');
  console.log(`${maior} - ${estadoFinal}`);
};

const menorCidade = (cidades, estados) => {
  let menor = '';
  let estado = '';
  cidades.forEach((cidade) => {
    if (menor == '') {
      menor = cidade.Nome;
    }
    if (cidade.Nome.length === menor.length) {
      menor = menor < cidade.Nome ? menor : cidade.Nome;
      estado = cidade.Estado;
    } else if (cidade.Nome.length < menor.length) {
      menor = cidade.Nome;
      estado = cidade.Estado;
    }
  });

  let estadoFinal = estados.find((e) => e.ID == estado).Sigla;
  console.log('*****Menor nome de todos.*****');
  console.log(`${menor} - ${estadoFinal}`);
};

export default router;
