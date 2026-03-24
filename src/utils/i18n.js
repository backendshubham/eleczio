/** Pick string for current language; supports legacy plain strings. */
function pick(val, lang) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const primary = lang === 'en' ? val.en : val.hi;
    const fallback = lang === 'en' ? val.hi : val.en;
    return String((primary || fallback || '').trim());
  }
  return String(val);
}

function loc(en, hi) {
  return { en: en == null ? '' : String(en), hi: hi == null ? '' : String(hi) };
}

module.exports = { pick, loc };
