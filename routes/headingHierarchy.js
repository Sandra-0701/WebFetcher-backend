const express = require('express');
const router = express.Router();
const getPageContent = require('../utils/getPageContent');
const processLink = require('../utils/processLink');

router.post('/', async (req, res) => {
  const { url, includeUhf = false } = req.body; // Default to false if not provided
  try {
    const $ = await getPageContent(url, includeUhf);
    if (!$) return res.status(500).send('Failed to fetch page content.');

    // Fetch link details
    const linkElements = $('a').toArray();
    const linkPromises = linkElements.map(link => processLink(link, $));
    const links = await Promise.all(linkPromises);

    // Fetch image details
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

    // Fetch headings
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((_, heading) => {
      headings.push({
        level: heading.tagName,
        text: $(heading).text().trim(),
      });
    });

    // Respond with all details including headings
    res.json({ links, images, headings });
  } catch (error) {
    console.error('Error in /all-details route:', error.message);
    res.status(500).send('Failed to process page content.');
  }
});

module.exports = router;
