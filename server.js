const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;  // Use Vercel's port or fallback to 5000 for local development

app.use(express.json());

// CORS configuration to allow your frontend origin
const corsOptions = {
  origin: 'https://web-fetcher-frontend.vercel.app', // Your frontend URL
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Apply this middleware to allow CORS

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

// Route use with error logging and handling
app.use('/api/extract-urls', extractUrls);
app.use('/api/link-details', linkDetails);
app.use('/api/image-details', imageDetails);
app.use('/api/video-details', videoDetails);
app.use('/api/page-properties', pageProperties);
app.use('/api/heading-hierarchy', headingHierarchy);
app.use('/api/all-details', allDetails);

// Error handling for all routes
app.use((err, req, res, next) => {
  console.error('An error occurred:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
