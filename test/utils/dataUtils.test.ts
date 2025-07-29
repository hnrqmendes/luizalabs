import { formatDate, formatPrice } from '../../src/utils/dataUtils';

describe('formatDate', () => {
    it('should format date from number to YYYY-MM-DD string', () => {
        expect(formatDate(20211201)).toBe('2021-12-01');
        expect(formatDate(19990101)).toBe('1999-01-01');
    });
});

describe('formatPrice', () => {
    it('should format number with two decimal places as string', () => {
        expect(formatPrice(12)).toBe('12.00');
        expect(formatPrice(12.5)).toBe('12.50');
        expect(formatPrice(12.345)).toBe('12.35');
    });
});
