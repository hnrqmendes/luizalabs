import fs from 'fs';
import * as readline from 'readline';
import { getOrders, processFileStream } from '../../src/services/orderService';
import * as dbUtils from '../../src/utils/dbUtils';
import { ParsedUrlQuery } from 'querystring';

jest.mock('fs');
jest.mock('readline');
jest.mock('../../src/utils/dbUtils');

describe('getOrders', () => {
    it('should call getOrdersBetweenDates when dates are provided', () => {
        const mock = jest
            .spyOn(dbUtils, 'getOrdersBetweenDates')
            .mockReturnValue([]);
        const query: ParsedUrlQuery = {
            dateStart: '20210101',
            dateEnd: '20210131',
        };

        const result = getOrders(query);

        expect(mock).toHaveBeenCalledWith(20210101, 20210131);
        expect(result).toEqual([]);
    });

    it('should call getAllOrders when dates are not provided', () => {
        const mock = jest.spyOn(dbUtils, 'getAllOrders').mockReturnValue([]);

        const result = getOrders({});

        expect(mock).toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});

describe('getRow', () => {
    const { getRow } = jest.requireActual('../../src/services/orderService');

    it('should correctly parse a line into Row object', () => {
        const line =
            '0000000001                                   User teste00000012340000005678      123.4520210101';
        const row = getRow(line);
        expect(row).toEqual({
            user_id: 1,
            user_name: 'User teste',
            order_id: 1234,
            product_id: 5678,
            product_price: 123.45,
            order_date: 20210101,
        });
    });
});

describe('processFileStream', () => {
    it('should call importRecord for each line', async () => {
        const fakeLine =
            '0000000001                                   User teste00000012340000005678      123.4520210101';

        const mockReadlineOn = jest
            .fn()
            .mockImplementation((event: string, callback: any) => {
                if (event === 'line') {
                    callback(fakeLine);
                }
                if (event === 'close') {
                    callback();
                }
            });

        jest.spyOn(fs, 'createReadStream').mockReturnValue({} as any);
        (readline.createInterface as any).mockReturnValue({
            on: mockReadlineOn,
        });

        const importMock = jest
            .spyOn(dbUtils, 'importRecord')
            .mockImplementation(() => {});

        processFileStream('teste.txt');

        expect(importMock).toHaveBeenCalledWith({
            user_id: 1,
            user_name: 'User teste',
            order_id: 1234,
            product_id: 5678,
            product_price: 123.45,
            order_date: 20210101,
        });
    });
});
