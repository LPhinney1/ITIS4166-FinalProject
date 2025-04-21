import express from 'express';
import * as bookmarkServices from '../services/bookmarkServices.js';

const bookmarkRouter = express.Router();

bookmarkRouter.get('/', async (req, res, next) => {
    try {
        const bookmarks = await bookmarkServices.getAllBookmarks();
        res.status(200).json(bookmarks);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.get('/:id', async (req, res, next) => {
    try {
        const bookmark = await bookmarkServices.getBookmarkById(+req.params.id);
        res.status(200).json(bookmark);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.post('/', async (req, res, next) => {
    try {
        const bookmark = await bookmarkServices.createBookmark(req.body);
        res.status(201).json(bookmark);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.put('/', async (req, res, next) => {
    try {
        const bookmark = await bookmarkServices.updateBookmark(req.body);
        res.status(200).json(bookmark);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.delete('/:id', async (req, res, next) => {
    try {
        await bookmarkServices.deleteBookmark(+req.params.id);
        res.status(200).json({ msg: `Bookmark ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});

//relationships
bookmarkRouter.get('/:id/tags', async (req, res, next) => {
    try {
        const tags = await bookmarkServices.getTagsForBookmark(+req.params.id);
        res.status(200).json(tags);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.get('/:id/collections', async (req, res, next) => {
    try {
        const collections = await bookmarkServices.getCollectionsForBookmark(+req.params.id);
        res.status(200).json(collections);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.post('/:id/tags', async (req, res, next) => {
    try {
        const bookmarkId = Number(req.params.id);
        const { tag_id } = req.body;
        const result = await bookmarkServices.addTagToBookmark(bookmarkId, tag_id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

bookmarkRouter.delete('/:bookmarkId/tags/:tagId', async (req, res, next) => {
    try {
        const { bookmarkId, tagId } = req.params;
        await bookmarkServices.removeTagFromBookmark(+bookmarkId, +tagId);
        res.status(200).json({ msg: `Removed tag ${tagId} from bookmark ${bookmarkId}` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});
export default bookmarkRouter;
