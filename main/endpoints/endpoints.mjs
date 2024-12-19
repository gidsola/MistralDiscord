
import logger from '../logger.mjs';

export const
  endpoints = {
    '/v1/ai_entry': async (req, res) => { await handleAIEntry(req, res) },
    '/v1/speech/xenova': async (req, res) => { await handleXenovaTTS(req, res) }
  };

async function handleXenovaTTS(req, res) {
  if (req.method === 'POST') {
    try {
      const
        body = await getRequestBody(req),
        { synthesize } = await import('../routes/speech/xenova/index.mjs'),
        result = await synthesize(body);

      res.writeHead(200, { 'Content-Type': 'audio/wav' });
      res.end(result);
    } catch (e) {
      logger.error('Error in handleXenovaTTS:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
  }
};

async function handleAIEntry(req, res) {
  try {
    const
      { POST } = await import('../routes/mistral/index.mjs'),
      body = await getRequestBody(req),
      result = await POST(body);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(result);
  } catch (e) {
    logger.error('Error in handleAIEntry:', e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
};

async function getRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request
      .on('data', chunk => body += chunk.toString())
      .on('end', () => resolve(body))
      .on('error', reject);
  });
};
