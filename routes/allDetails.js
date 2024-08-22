const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();
const getPageContent = require('../utils/getPageContent');
const processLink = require('../utils/processLink');

router.post('/', async (req, res) => {
  const { url, includeUhf = false } = req.body; // Default to false if not provided
  try {
    // Fetch content with Cheerio for links, images, headings
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

    // Fetch video details with Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const videoDetails = await page.evaluate(async () => {
      const videoDetailsList = [];
      const videoElements = document.querySelectorAll("universal-media-player");

      // Helper function to wait for the audio track button to be rendered
      const waitForRender = (videoElement) => {
        return new Promise((resolve) => {
          const checkButton = () => {
            const audioTrackButton = videoElement.querySelector('.vjs-audio-button.vjs-menu-button.vjs-menu-button-popup.vjs-button');
            if (audioTrackButton) {
              resolve(audioTrackButton);
            } else {
              requestAnimationFrame(checkButton);
            }
          };
          checkButton();
        });
      };

      for (const videoElement of videoElements) {
        const options = JSON.parse(videoElement.getAttribute("options"));

        const audioTrackButton = await waitForRender(videoElement);
        const audioTrackPresent = audioTrackButton && audioTrackButton.querySelector('span.vjs-control-text') ? "yes" : "no";

        const videoDetail = {
          transcript: options.downloadableFiles
            .filter(file => file.mediaType === "transcript")
            .map(file => file.locale),
          cc: options.ccFiles.map(file => file.locale),
          autoplay: options.autoplay ? "yes" : "no",
          muted: options.muted ? "yes" : "no",
          ariaLabel: options.ariaLabel || options.title || "",
          audioTrack: audioTrackPresent,
        };

        videoDetailsList.push(videoDetail);
      }

      return videoDetailsList;
    });

    await browser.close();

    // Respond with all details including video details
    res.json({ links, images, headings, videos: videoDetails });
  } catch (error) {
    console.error('Error in /all-details route:', error.message);
    res.status(500).send('Failed to process page content.');
  }
});

module.exports = router;
