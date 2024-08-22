const express = require('express');
const router = express.Router();
const getPageContent = require('../utils/getPageContent');

router.post('/', async (req, res) => {
  const { url, includeUhf } = req.body;
  const $ = await getPageContent(url, includeUhf);
  if (!$) return res.status(500).send('Failed to fetch page content.');

  const images = [];
  $('img').each((_, element) => {
    const src = $(element).attr('src');
    if (src) {
      const alt = $(element).attr('alt');
      images.push({
        imageName: src,
        alt: alt || 'No Alt Text',
        hasAlt: !!alt,
      });
    }
  });

  res.json({ images });
});

module.exports = router;
