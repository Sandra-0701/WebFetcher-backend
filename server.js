const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;  // Use Vercel's port or fallback to 5000 for local development

app.use(express.json());

// Setup CORS to allow requests only from your frontend domain
const corsOptions = {
  origin: 'https://web-fetcher-frontend.vercel.app',  // Your frontend URL
  optionsSuccessStatus: 200,  // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Route imports
const extractUrls = require('./routes/extractUrls');
const linkDetails = require('./routes/linkDetails');
const imageDetails = require('./routes/imageDetails');
const videoDetails = require('./routes/videoDetails');
const pageProperties = require('./routes/pageProperties');
const headingHierarchy = require('./routes/headingHierarchy');
const allDetails = require('./routes/allDetails');

// Test route
app.get('/api/test', (req, res) => {
  res.send('Server is running correctly!');
});

// Route use
app.use('/api/extract-urls', extractUrls);
app.use('/api/link-details', linkDetails);
app.use('/api/image-details', imageDetails);
app.use('/api/video-details', videoDetails);
app.use('/api/page-properties', pageProperties);
app.use('/api/heading-hierarchy', headingHierarchy);
app.use('/api/all-details', allDetails);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
