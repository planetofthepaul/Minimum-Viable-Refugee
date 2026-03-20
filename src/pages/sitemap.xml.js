import { getAllCities } from '../lib/airtable.js';

export async function GET() {
  const cities = await getAllCities();
  const site = 'https://minimumviableexpat.com';
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    { loc: `${site}/`, priority: '1.0' },
    { loc: `${site}/about/`, priority: '0.5' },
    { loc: `${site}/terms/`, priority: '0.3' },
    ...cities.map(c => ({ loc: `${site}/city/${c.id}/`, priority: '0.7' }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
