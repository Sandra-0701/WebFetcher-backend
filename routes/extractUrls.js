const express = require('express');
const router = express.Router();
const getPageContent = require('../utils/getPageContent');

router.post('/', async (req, res) => {
  const { url, includeUhf } = req.body;
  const $ = await getPageContent(url, includeUhf);
  if (!$) return res.status(500).send('Failed to fetch page content.');

  const urls = $('a[href]')
    .map((_, element) => $(element).attr('href'))
    .get()
    .filter(href => href.startsWith('http'));

  res.json({ urls });
});

module.exports = router;
