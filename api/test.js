const axios = require('axios');

export default function handler(req, res) {
  res.status(200).json({ message: 'axios loaded', version: axios.VERSION || 'unknown' });
}
