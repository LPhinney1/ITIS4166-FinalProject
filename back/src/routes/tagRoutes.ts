import express from 'express';
import * as tagServices from '../services/tagServices.js';

const tagRouter = express.Router();

tagRouter.get('/', async (req, res, next) => {
    try {
        const tags = await tagServices.getAllTags();
        res.status(200).json(tags);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

tagRouter.get('/:id', async (req, res, next) => {
    try {
        const tag = await tagServices.getTagById(+req.params.id);
        res.status(200).json(tag);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

tagRouter.post('/', async (req, res, next) => {
    try {
        const tag = await tagServices.createTag(req.body);
        res.status(201).json(tag);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

tagRouter.put('/', async (req, res, next) => {
    try {
        const tag = await tagServices.updateTag(req.body);
        res.status(200).json(tag);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

tagRouter.delete('/:id', async (req, res, next) => {
    try {
        await tagServices.deleteTag(+req.params.id);
        res.status(200).json({ msg: `Tag ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});

//relationships
tagRouter.get('/:id/bookmarks', async (req, res, next) => {
    try {
        const bookmarks = await tagServices.getBookmarksForTag(+req.params.id);
        res.status(200).json(bookmarks);
    } catch (err) {
        res.status(400);
        next(err);
    }
});
export default tagRouter;
