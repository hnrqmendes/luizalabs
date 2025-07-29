import { IncomingMessage, ServerResponse } from 'http';
import { router } from '../src/router';
import * as orderService from '../src/services/orderService';
import * as dbUtils from '../src/utils/dbUtils';

jest.mock('../src/services/orderService');
jest.mock('../src/utils/dbUtils');

function mockReqRes(
    path: string,
    method = 'GET'
): [IncomingMessage, ServerResponse] {
    const req = {
        url: path,
        method,
    } as IncomingMessage;

    const res = {
        writeHead: jest.fn(),
        end: jest.fn(),
    } as unknown as ServerResponse;

    return [req, res];
}

describe('router', () => {
    test('GET /orders calls getOrders and responds with 200', () => {
        const [req, res] = mockReqRes('/orders');
        (orderService.getOrders as jest.Mock).mockReturnValue([]);

        router(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(200, {
            'Content-Type': 'application/json',
        });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify([]));
    });

    test('GET /orders/123 calls getOrderById', () => {
        const [req, res] = mockReqRes('/orders/123');
        (dbUtils.getOrderById as jest.Mock).mockReturnValue({ order_id: 123 });

        router(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(200, {
            'Content-Type': 'application/json',
        });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ order_id: 123 }));
    });

    test('Unmatched route returns 404', () => {
        const [req, res] = mockReqRes('/unknown');
        router(req, res);
        expect(res.writeHead).toHaveBeenCalledWith(404, {
            'Content-Type': 'application/json',
        });
    });
});
