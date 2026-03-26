const https = require('https');

module.exports = (req, res) => {
  const params = new URLSearchParams();
  if (req.query.mobile) params.set('mobile', req.query.mobile);
  if (req.query.accountId) params.set('accountId', req.query.accountId);

  const apiUrl = `https://message-orchestrator-service.i2e1.in/v1/messages?${params.toString()}`;

  https.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(apiRes.statusCode).send(data);
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
};
