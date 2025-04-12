import express from 'express';
import * as services from '../services/services.js'

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

export default appRouter;
