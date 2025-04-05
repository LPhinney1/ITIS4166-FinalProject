import express from 'express';
import cors from 'cors';
import { migrateToLatest } from './database/migrate.js';
import { db } from './database/db.js';

await migrateToLatest();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        const users = await db.selectFrom('users').selectAll().execute();
        const blogPosts = await db.selectFrom('blog_posts').selectAll().execute();
        const comments = await db.selectFrom('comments').selectAll().execute();
        const tags = await db.selectFrom('tags').selectAll().execute();
        const blogPostTags = await db.selectFrom('blog_post_tags').selectAll().execute();

        res.status(200).json({
            users,
            blogPosts,
            comments,
            tags,
            blogPostTags,
        });
    } catch (error) {
        console.error('Error fetching data for health check:', error);
        res.status(500).json({error: 'Failed to fetch data for health check'});
    }
});

app.listen(3000, () => console.log('Backend running @\nhttp://localhost:3000/'));
