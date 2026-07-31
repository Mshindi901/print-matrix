import crypto from 'crypto';
import Print_Agent from '../printer-agent/schema.js';

export async function agentAuth(req, res, next) {
  const agentId = req.header('x-agent-id');
  const apiKey = req.header('x-agent-key');

  if (!agentId || !apiKey) {
    return res.status(401).json({ success: false, message: 'Missing Credentials' });
  }

  const is_agent = await Print_Agent.findByPk(agentId);
  if (!is_agent) {
    return res.status(401).json({ success: false, message: 'Not an agent id' });
  }

  // Hash the incoming key
  const received_key = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Ensure buffers exist and have matching byte lengths before comparison
  const bufReceived = Buffer.from(received_key, 'hex');
  const bufStored = Buffer.from(is_agent.api_key || '', 'hex'); // Assuming is_agent.apiKey is a hex hash

  if (bufReceived.length !== bufStored.length || !crypto.timingSafeEqual(bufReceived, bufStored)) {
    return res.status(401).json({ success: false, message: 'Invalid Api key' });
  }

  req.is_agent = is_agent;
  next();
}