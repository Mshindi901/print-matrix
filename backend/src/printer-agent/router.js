import express from 'express';
import {new_agent, get_agent, get_agent_name, get_all_agents, delete_agent} from './controller.js'
import authentication from '../middleware/authentication.js';

const router = express.Router();

router.post('/agent', authentication, new_agent);

router.get('/agent/:id', authentication, get_agent);
router.get('/agent', authentication, get_agent_name);
router.get('/all/agent', authentication, get_all_agents);

router.delete('/agent/:id', authentication, delete_agent);

export default router;
