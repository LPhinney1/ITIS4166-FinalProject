import express from 'express';
import cors from 'cors';
import { migrateToLatest } from './database/migrate.js';
import userRouter from './routes/userRoutes.js';

await migrateToLatest();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);

app.listen(3000, () => console.log('Backend running @\n\x1b[33mhttp://localhost:3000/\x1b[0m'));
