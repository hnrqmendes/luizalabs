import { IncomingMessage, ServerResponse } from 'http';
import Busboy from 'busboy';
import path from 'path';
import fs from 'fs';
import { processFileStream } from '../services/orderService';

//Recebe e salva o arquivo, retornando ok para o recebimento, em background faz o tratamento e inserção de dados no banco
export function handleUpload(req: IncomingMessage, res: ServerResponse) {
    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, info) => {
        const { filename } = info;const uploadDir = path.join(__dirname, '../uploads');

        if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        }

        const saveTo = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(saveTo);
        file.pipe(writeStream);
        writeStream.on('finish', () => {
            console.log(
                'Arquivo salvo com sucesso. Dados em processo de importação.'
            );
            processFileStream(saveTo);
        });

        writeStream.on('error', (err) => {
            console.error('Erro ao salvar:', err);
        });
    });

    busboy.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                success: true,
                message:
                    'Arquivo salvo com sucesso. Dados em processo de importação',
            })
        );
    });

    req.pipe(busboy);
}
