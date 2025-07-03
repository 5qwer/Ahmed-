export default async function handler(req, res) {
  const { path } = req.query;
  if (req.method === 'GET') {
    if (path === 'all') return res.json({ students: [] });
    return res.status(404).json({ error: 'Invalid path' });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
