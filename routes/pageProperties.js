const express = require('express');
const router = express.Router();
const getPageContent = require('../utils/getPageContent');

router.post('/', async (req, res) => {
  const { url } = req.body; // Remove includeUhf as it's no longer needed
  try {
    const root = await getPageContent(url);
    if (!root) return res.status(500).send('Failed to fetch page content.');

    const metaTags = [];
    root.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name');
      const property = meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name || property) {
        metaTags.push({
          name: name || property,
          content: content || 'No Content',
        });
      }
    });

    res.json({ metaTags });
  } catch (error) {
    console.error('Error in /page-properties route:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
