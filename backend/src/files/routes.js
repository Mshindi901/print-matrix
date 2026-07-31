import express from 'express';
import {fileUpload, getFileInfoById, download_files, usersFiles, deleteFileRecord} from './controller.js';
import authentication from '../middleware/authentication.js';
import authorization from '../middleware/authorization.js';
import upload from './multer.js';

const router = express.Router();

router.post(['/file', '/files/upload'], authentication, authorization('user'), upload.single('file'), fileUpload);

router.get(['/file/:id', '/files/:id'], authentication, getFileInfoById);
router.get('/files',authentication, authorization('user'), usersFiles);

router.get('/download/agent/:id', download_files);

router.delete(['/file/:id', '/files/:id'], authentication, deleteFileRecord);

export default router;
