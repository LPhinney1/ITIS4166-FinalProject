import express from 'express';
import * as collectionServices from '../services/collectionServices.js';

const collectionRouter = express.Router();

collectionRouter.get('/', async (req, res, next) => {
    try {
        const collections = await collectionServices.getAllCollections();
        res.status(200).json(collections);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

collectionRouter.get('/:id', async (req, res, next) => {
    try {
        const collection = await collectionServices.getCollectionById(+req.params.id);
        res.status(200).json(collection);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

collectionRouter.post('/', async (req, res, next) => {
    try {
        const collection = await collectionServices.createCollection(req.body);
        res.status(201).json(collection);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

collectionRouter.put('/', async (req, res, next) => {
    try {
        const collection = await collectionServices.updateCollection(req.body);
        res.status(200).json(collection);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

collectionRouter.delete('/:id', async (req, res, next) => {
    try {
        await collectionServices.deleteCollection(+req.params.id);
        res.status(200).json({ msg: `Collection ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});

//relationships
collectionRouter.post('/:id/bookmarks', async (req, res, next) => {
    try {
        const collectionId = Number(req.params.id);
        const { bookmark_id } = req.body;
        const result = await collectionServices.addBookmarkToCollection(collectionId, bookmark_id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

collectionRouter.get('/:id/bookmarks', async (req, res, next) => {
    try {
        const bookmarks = await collectionServices.getBookmarksInCollection(+req.params.id);
        res.status(200).json(bookmarks);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

collectionRouter.delete('/:collectionId/bookmarks/:bookmarkId', async (req, res, next) => {
    try {
        const { collectionId, bookmarkId } = req.params;
        await collectionServices.removeBookmarkFromCollection(+collectionId, +bookmarkId);
        res.status(200).json({ msg: `Removed bookmark ${bookmarkId} from collection ${collectionId}` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});
export default collectionRouter;
