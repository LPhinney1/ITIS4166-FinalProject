import express from 'express';
import * as services from '../services/services.js';

const appRouter = express.Router();

appRouter.get('/users', async (req, res, next) => {
    try {
        const users = await services.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(400);
        next(err);
    }
});
appRouter.get('/users/:id', async (req, res, next) => {
    try {
        const user = await services.getUserById(+req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

appRouter.post('/users', async (req, res, next) => {
    try {
        const user = await services.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

appRouter.put('/users/', async (req, res, next) => {
    try {
        const user = await services.updateUser(req.body);
        res.status(200).json(user);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

appRouter.delete('/users/:id', async (req, res, next) => {
    try {
        await services.deleteUser(+req.params.id);
        res.status(200).json({ msg: `User ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});
export default appRouter;
