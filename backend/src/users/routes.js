import express from 'express';
import {getAll, getByEmail, getById, getByPhone, update, deleteUser} from './controller.js';
import authentication from '../middleware/authentication.js';

const router = express.Router();


router.get('/user/:email', authentication, getByEmail);

router.get('/user', authentication, getByPhone);

router.get('/user', authentication, getById);

router.put('/user', authentication, update);

router.delete('/user/:id', authentication, deleteUser);

export default router;