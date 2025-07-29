import { IncomingMessage, ServerResponse } from 'http';
import { handleUpload } from './controllers/orderController';
import { getOrderById } from './utils/dbUtils';
import url from 'url';
import { getOrders } from './services/orderService';
import fs from 'fs';
import path from 'path';

const publicPath = path.join(__dirname, '../public');
const swaggerUiPath = require('swagger-ui-dist').getAbsoluteFSPath();
const swaggerJson = fs.readFileSync(
    path.join(publicPath, 'swagger.json'),
    'utf-8'
);
const docsHtml = fs.readFileSync(path.join(publicPath, 'docs.html'), 'utf8');

//Controle de rotas, toda chamada passa por esse tratamento, e então é redirecionada caso precise de algum tratamento
export function router(req: IncomingMessage, res: ServerResponse) {
    const parsedUrl = url.parse(req.url || '', true);
    const method = req.method || 'GET';

    if (method === 'GET' && parsedUrl.pathname === '/swagger.json') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(swaggerJson);
        return;
    }

    if (parsedUrl.pathname?.startsWith('/swagger-ui/')) {
        const requestedFile = parsedUrl.pathname.replace('/swagger-ui/', '');
        const filePath = path.join(swaggerUiPath, requestedFile);

        // Detecta tipo do conteúdo
        const ext = path.extname(requestedFile);
        const contentTypes: any = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.map': 'application/json',
        };
        let contentType = contentTypes[ext] || 'application/octet-stream';
        if (/^(text\/|application\/(json|javascript))/.test(contentType)) {
            contentType += '; charset=utf-8';
        }
        return serveStaticFile(filePath, res, contentType);
    }

    // Serve docs.html
    if (parsedUrl.pathname === '/docs' || parsedUrl.pathname === '/docs.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(docsHtml);
        return;
    }

    /**
     * @swagger
     * /orders:
     *   get:
     *     summary: Retorna todos os pedidos ou pedidos entre duas datas
     *     description: Pode ser usado com ou sem os parâmetros de data. Se `dateStart` e `dateEnd` forem fornecidos, retorna apenas os pedidos nesse intervalo.
     *     tags:
     *       - Orders
     *     parameters:
     *       - in: query
     *         name: dateStart
     *         required: false
     *         schema:
     *           type: integer
     *           example: 20210303
     *         description: Data inicial no formato YYYYMMDD
     *       - in: query
     *         name: dateEnd
     *         required: false
     *         schema:
     *           type: integer
     *           example: 20210305
     *         description: Data final no formato YYYYMMDD
     *     responses:
     *       200:
     *         description: Lista de pedidos retornada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   user_id:
     *                     type: integer
     *                   user_name:
     *                     type: string
     *                   order_id:
     *                     type: integer
     *                   product_id:
     *                     type: integer
     *                   product_price:
     *                     type: number
     *                   order_date:
     *                     type: integer
     *       500:
     *         description: Erro interno ao buscar pedidos
     */

    if (method === 'GET' && parsedUrl.pathname === '/orders') {
        try {
            const orders = getOrders(parsedUrl.query);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(orders));
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Erro ao buscar pedidos' }));
        }
        return;
    }

    /**
     * @swagger
     * /orders/{id}:
     *   get:
     *     summary: Buscar pedido por ID
     *     description: Retorna os dados de um pedido específico com base no ID fornecido.
     *     tags:
     *       - Orders
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do pedido
     *     responses:
     *       200:
     *         description: Pedido encontrado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   user_id:
     *                     type: integer
     *                   user_name:
     *                     type: string
     *                   order_id:
     *                     type: integer
     *                   product_id:
     *                     type: integer
     *                   product_price:
     *                     type: number
     *                   order_date:
     *                     type: integer
     *       404:
     *         description: Pedido não encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Pedido não encontrado
     *       500:
     *         description: Erro interno ao buscar o pedido
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Erro ao buscar pedido
     */

    if (method === 'GET' && parsedUrl.pathname?.startsWith('/orders/')) {
        const idStr = parsedUrl.pathname.split('/')[2];
        const id = Number(idStr);
        try {
            const order = getOrderById(id);
            if (!order) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Pedido não encontrado' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(order));
        } catch {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Erro ao buscar pedido' }));
        }
        return;
    }

    /**
     * @swagger
     * /orders/upload:
     *   post:
     *     summary: Enviar arquivo de pedidos
     *     description: Faz o upload de um arquivo contendo pedidos para serem processados.
     *     tags:
     *       - Orders
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Arquivo contendo os pedidos
     *     responses:
     *       200:
     *         description: Upload realizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Arquivo salvo com sucesso. Dados em processo de importação
     *       400:
     *         description: Requisição inválida
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Arquivo ausente ou inválido
     *       500:
     *         description: Erro interno ao processar upload
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Erro no upload
     */

    if (method === 'POST' && parsedUrl.pathname === '/orders/upload') {
        try {
            handleUpload(req, res);
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Erro no upload' }));
        }
        return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rota não encontrada' }));
}

function serveStaticFile(
    filePath: any,
    res: any,
    contentType = 'application/octet-stream'
) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Arquivo não encontrado');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}
