import express from 'express';
import {add_job, get_user_jobs, get_print_jobs_id, get_agent_pending_jobs, delete_job, jobCompleted, jobDownloading, jobPrinting, jobFailed} from './controller.js'
import authentication from '../middleware/authentication.js';
import authorization from '../middleware/authorization.js';
import { agentAuth } from '../middleware/agent-auth.js';

const router = express.Router();

router.post(['/print-job', '/print-jobs'], authentication, authorization('user'), add_job);

router.get(['/print-jobs/user', '/print-jobs'], authentication, authorization('user'), get_user_jobs);
router.get('/print-jobs/:id', authentication, get_print_jobs_id);

router.get('/print-job/agent', agentAuth, get_agent_pending_jobs);

router.put('print-job/completed/:id', authentication, jobCompleted);
router.put('print-job/downloading/:id', authentication, jobDownloading);
router.put('print-job/printing/:id', authentication, jobPrinting);
router.put('print-job/failed/:id', authentication, jobFailed)

router.delete('/print-jobs/:id', authentication, authorization('user'), delete_job);

export default router;
