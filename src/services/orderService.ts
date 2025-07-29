import fs from 'fs';
import readline from 'readline';
import {
    getAllOrders,
    getOrdersBetweenDates,
    importRecord,
} from '../utils/dbUtils';
import { ParsedUrlQuery } from 'querystring';
import { Row } from '../types/Row';

//Processa linha a linha do arquivo, separando os dados e os salvando
export function processFileStream(filePath: string) {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
        try {
            const data = getRow(line);
            importRecord(data);
        } catch (err: any) {
            console.error('Erro ao processar linha:', err.message);
        }
    });

    rl.on('close', () => {
        console.log('Arquivo processado completamente.');
    });

    rl.on('error', (err) => {
        console.error('Erro ao ler arquivo:', err.message);
    });
}

//Faz o devido tratamento de busca de dados, seja por datas ou busca completa
export function getOrders(query: ParsedUrlQuery) {
    const { dateStart, dateEnd } = query;
    if (dateStart && dateEnd) {
        return getOrdersBetweenDates(Number(dateStart), Number(dateEnd));
    } else {
        return getAllOrders();
    }
}

//Faz o tratamento da linha do arquivo, transformando os dados em um objeto
export function getRow(line: string): Row {
    return {
        user_id: Number(line.slice(0, 10)),
        user_name: line.slice(10, 55).trim(),
        order_id: Number(line.slice(55, 65)),
        product_id: Number(line.slice(65, 75)),
        product_price: Number(line.slice(75, 87)),
        order_date: Number(line.slice(87, 95)),
    };
}
