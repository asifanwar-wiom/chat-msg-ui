const https = require('https');

const UPSTREAM_URL = process.env.UPSTREAM_API_URL_QA
  || 'https://message-orchestrator-service.qa.i2e1.in/v1/messages';
const PASSWORD = process.env.APP_PASSWORD_QA || process.env.APP_PASSWORD;

module.exports = (req, res) => {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Password check
  const token = req.query.token || req.headers['x-auth-token'];
  if (token !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Build upstream params — only allow known params through
  const allowed = ['mobile', 'accountId', 'page', 'size'];
  const params = new URLSearchParams();
  allowed.forEach(key => {
    if (req.query[key]) params.set(key, req.query[key]);
  });
  if (!params.has('page')) params.set('page', '0');
  if (!params.has('size')) params.set('size', '20');

  const apiUrl = `${UPSTREAM_URL}?${params.toString()}`;

  https.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.status(apiRes.statusCode).send(data);
    });
  }).on('error', () => {
    res.status(502).json({ error: 'Service unavailable' });
  });
};
