/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://qudely-ai.vercel.app',
    generateRobotsTxt: true, // Generate robots.txt file
      sitemapSize: 5000,        // Split sitemap if more than 5000 URLs
        changefreq: 'daily',      // Optional: suggest how often pages are updated
          priority: 0.8,            // Default priority
            exclude: ['/api/*'],      // Optional: exclude API routes
            };