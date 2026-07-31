import express from 'express';
import {getDashboardStatistics, getAllFiles, getAllPrinters, getAllUsers} from './controller.js';
import authentication from '../middleware/authentication.js';
import authorization from '../middleware/authorization.js';

const router = express.Router();

router.get('/admin/dashboard', authentication, authorization('admin'), getDashboardStatistics);
router.get('/admin/user', authentication, authorization('admin'), getAllUsers);
router.get('/admin/files', authentication, authorization('admin'), getAllFiles);
router.get('/admin/printers', authentication, authorization('admin'), getAllPrinters);

export default router;
