const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.error('Error: URL is missing from the request body');
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Handle page navigation errors
    try {
      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
    } catch (err) {
      console.error(`Error navigating to page at ${url}:`, err.message);
      await browser.close();
      return res.status(500).json({ message: 'Failed to load the webpage', error: err.message });
    }

    // Extract video details
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
        try {
          const options = JSON.parse(videoElement.getAttribute("options"));

          // Wait for the audio track button to render if present
          const audioTrackButton = await waitForRender(videoElement).catch(() => null);
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
        } catch (videoError) {
          console.error('Error processing video element:', videoError.message);
        }
      }

      return videoDetailsList;
    });

    await browser.close();
    
    console.log('Video details successfully extracted:', videoDetails);
    res.json({ videos: videoDetails });
  } catch (error) {
    console.error('Error processing /api/video-details:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
