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

userRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        res.sendStatus(401);
        return;
    }
    try {
        const token = await userServices.login(username, password);
        res.status(200).json({ token });
    } catch (err) {
        res.sendStatus(401);
        next(err);
    }
});
export default userRouter;
