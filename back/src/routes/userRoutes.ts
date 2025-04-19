import express from 'express';
import * as userServices from '../services/userServices.js';

const userRouter = express.Router();

userRouter.get('/', async (req, res, next) => {
    try {
        const users = await userServices.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

userRouter.get('/:id', async (req, res, next) => {
    try {
        const user = await userServices.getUserById(+req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

userRouter.post('/', async (req, res, next) => {
    try {
        const user = await userServices.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

userRouter.put('/', async (req, res, next) => {
    try {
        const user = await userServices.updateUser(req.body);
        res.status(200).json(user);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

userRouter.delete('/:id', async (req, res, next) => {
    try {
        await userServices.deleteUser(+req.params.id);
        res.status(200).json({ msg: `User ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(400);
        next(err);
    }
});
export default userRouter;
