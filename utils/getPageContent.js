const axios = require('axios');
const cheerio = require('cheerio');

const getPageContent = async (url, includeUhf) => {
  try {
    const { data } = await axios.get(url);
    let $ = cheerio.load(data);

    if (!includeUhf) {
      const primaryAreaContent = $('main.microsoft-template-layout-container').html();
      $ = cheerio.load(primaryAreaContent || '');
    }

    return $;
  } catch (error) {
    console.error('Error fetching page:', error.message);
    return null;
  }
};

module.exports = getPageContent;
