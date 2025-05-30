import snapsave from '../snapsave-downloader/src/index.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  }

  try {
    const downloadedURL = await snapsave(url);
    return res.status(200).json({ url: downloadedURL });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
