/**
 * India mobiles stored as 10 digits (or longer with leading 0).
 * tel: links use E.164 +91; labels show "+91 …" for display.
 */

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

/** @returns {string} e.g. tel:+919826099647 */
function indiaTelHref(phone) {
  const d = digitsOnly(phone);
  const last10 = d.length >= 10 ? d.slice(-10) : d;
  if (last10.length === 10) return `tel:+91${last10}`;
  if (d) return `tel:+${d}`;
  return 'tel:';
}

/**
 * @param {string} phone - stored digits
 * @param {string} [phoneDisplay] - optional pretty form e.g. "98260 99647"
 * @returns {string} e.g. "+91 98260 99647"
 */
function indiaTelLabel(phone, phoneDisplay) {
  const disp = String(phoneDisplay || '').trim();
  if (/^\+91\b/.test(disp)) return disp;
  const d = digitsOnly(phone).slice(-10);
  if (d.length !== 10) {
    return disp ? `+91 ${disp}` : '';
  }
  const pretty = disp || `${d.slice(0, 5)} ${d.slice(5)}`;
  return `+91 ${pretty}`;
}

module.exports = { indiaTelHref, indiaTelLabel, digitsOnly };
