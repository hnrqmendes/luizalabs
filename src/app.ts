import http from 'http';
import { router } from './router';

export const app = http.createServer((req, res) => {
    router(req, res);
});
