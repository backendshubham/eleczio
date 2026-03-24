function slugify(s) {
  const base = String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'service';
}

async function uniqueServiceSlug(ServiceItem, base, excludeId) {
  let slug = base || 'service';
  let n = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await ServiceItem.findOne(q).select('_id').lean();
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

module.exports = { slugify, uniqueServiceSlug };
