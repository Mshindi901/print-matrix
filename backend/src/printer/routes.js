import express from 'express';
import {add_printer, get_all_printers, get_printer_by_id, get_printer_by_name, get_printer_by_ip, update_printer_status, delete_printer} from './controller.js';
import authentication from '../middleware/authentication.js';
import authorization from '../middleware/authorization.js';

const router = express.Router();

router.get('/printers', authentication, get_all_printers);
router.post(['/printer', '/printers'], authentication, authorization('admin'), add_printer);
router.patch('/printers/:id/status', authentication, authorization('admin'), update_printer_status);

router.get(['/printer/:id', '/printers/:id'], authentication, get_printer_by_id);
router.get('/printer/name',  authentication, get_printer_by_name);
router.get('/printer/ip', authentication, get_printer_by_ip);

router.delete(['/printer/:id', '/printers/:id'], authentication, authorization('admin'), delete_printer);

export default router;
