import { app } from './app';
import './config/dotenv';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Swagger UI em http://localhost:${PORT}/docs`);
});
