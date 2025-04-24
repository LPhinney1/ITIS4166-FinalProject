import express from 'express';
import cors from 'cors';
import { migrateToLatest } from './database/migrate.js';
import userRouter from './routes/userRoutes.js';
import bookmarkRouter from './routes/bookmarkRoutes.js';
import tagRouter from './routes/tagRoutes.js';
import collectionRouter from './routes/collectionRoutes.js';
import { db } from './database/db.js';
import { verifyAuthToken } from './services/middlewareServices.js';
import * as dotenv from 'dotenv';
dotenv.config();

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
        console.error('Error fetching all tables:', error);
        res.status(500).json({ error: 'Failed to fetch data for health check' });
    }
});

app.use('/api/users', userRouter); //BEFORE MIDDLEWARE AUTHORIZATION

app.use(async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        res.sendStatus(401);
        return;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        res.sendStatus(401);
        return;
    }
    try {
        res.locals.userId = await verifyAuthToken(token);
        next();
    } catch {
        res.sendStatus(401);
    }
});

app.use('/api/bookmarks', bookmarkRouter);
app.use('/api/tags', tagRouter);
app.use('/api/collections', collectionRouter);

const HOST = process.env.HOST;
app.listen(3000, () => console.log(`Backend running @\n\x1b[35mhttp://${HOST}:3000/\x1b[0m`));
