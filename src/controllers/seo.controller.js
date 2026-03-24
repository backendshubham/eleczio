const ServiceItem = require('../models/ServiceItem');
const { getBaseUrl } = require('../config/seo');

exports.getRobotsTxt = (req, res) => {
  const base = getBaseUrl();
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    ''
  ];
  res.type('text/plain; charset=utf-8');
  res.send(lines.join('\n'));
};

exports.getSitemapXml = async (req, res) => {
  const base = getBaseUrl();
  const now = new Date().toISOString().split('T')[0];

  const staticPaths = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.85' },
    { loc: '/services', changefreq: 'weekly', priority: '0.95' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.9' }
  ];

  let urls = staticPaths.map(
    (p) => `  <url>
    <loc>${escapeXml(`${base}${p.loc}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  try {
    const services = await ServiceItem.find({ is_active: true })
      .select('slug updated_at')
      .sort({ sort_order: 1 })
      .lean();
    for (const s of services) {
      if (!s.slug) continue;
      const raw = s.updated_at || s.created_at;
      const mod = raw
        ? new Date(raw).toISOString().split('T')[0]
        : now;
      urls.push(`  <url>
    <loc>${escapeXml(`${base}/services/${s.slug}`)}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  } catch (e) {
    console.error('[sitemap]', e.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.type('application/xml; charset=utf-8');
  res.send(xml);
};

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
