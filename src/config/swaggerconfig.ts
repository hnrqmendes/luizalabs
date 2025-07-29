import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LuizaLabs - Desafio técnico - Vertical Logística',
            version: '1.0.0',
        },
    },
    apis: ['./src/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

fs.writeFileSync(
    path.join(__dirname, '../../public', 'swagger.json'),
    JSON.stringify(swaggerSpec, null, 2)
);
