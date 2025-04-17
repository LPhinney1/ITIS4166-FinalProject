import express from 'express';
import cors from 'cors';
import { migrateToLatest } from './database/migrate.js';
import userRouter from './routes/userRoutes.js';
import { db } from './database/db.js';
import * as dotenv from 'dotenv'; dotenv.config();

await migrateToLatest();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        const users = await db.selectFrom('users').selectAll().execute();
        const bookmarks = await db.selectFrom('bookmarks').selectAll().execute();
        const tags = await db.selectFrom('tags').selectAll().execute();
        const collections = await db.selectFrom('collections').selectAll().execute();
        const bookmark_tags = await db.selectFrom('bookmark_tags').selectAll().execute();
        const collection_bookmarks = await db.selectFrom('collection_bookmarks').selectAll().execute();
        res.status(200).json({
            users,
            bookmarks,
            tags,
            collections,
            bookmark_tags,
            collection_bookmarks,
        });
    } catch (error) {
        console.error('Error fetching data for health check:', error);
        res.status(500).json({ error: 'Failed to fetch data for health check' });
    }
});

app.use('/api/users', userRouter);

const HOST = process.env.HOST;
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Backend running @\n\x1b[35mhttp://${HOST}:${PORT}/\x1b[0m`));
