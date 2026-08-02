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

  // Accept either a plain text API key or a pre-hashed SHA-256 hex API key.
  let receivedKeyHex;
  const hexKeyPattern = /^[a-fA-F0-9]{64}$/;
  if (hexKeyPattern.test(apiKey)) {
    receivedKeyHex = apiKey.toLowerCase();
  } else {
    receivedKeyHex = crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  const bufReceived = Buffer.from(receivedKeyHex, 'hex');
  const bufStored = Buffer.from(is_agent.api_key || '', 'hex');

  if (bufReceived.length !== bufStored.length || !crypto.timingSafeEqual(bufReceived, bufStored)) {
    return res.status(401).json({ success: false, message: 'Invalid Api key' });
  }

  req.is_agent = is_agent;
  next();
}