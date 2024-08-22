const express = require('express');
const router = express.Router();
const getPageContent = require('../utils/getPageContent');
const processLink = require('../utils/processLink');

router.post('/', async (req, res) => {
  const { url, includeUhf } = req.body;
  const $ = await getPageContent(url, includeUhf);
  if (!$) return res.status(500).send('Failed to fetch page content.');

  const linkElements = $('a').toArray();
  const linkPromises = linkElements.map(link => processLink(link, $));
  const results = await Promise.all(linkPromises);
  res.json({ links: results });
});

module.exports = router;
