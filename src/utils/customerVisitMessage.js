/**
 * Build WhatsApp visit confirmation (Hinglish), IST calendar for aaj/kal/parso.
 * Formatting: WhatsApp uses *one* asterisk for bold (not **). Time uses ```monospace``` block.
 * visitYmd — "YYYY-MM-DD"
 */
function istTodayYmd() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function ymdToUtcMs(ymd) {
  const [y, m, d] = String(ymd)
    .split('-')
    .map((n) => parseInt(n, 10));
  if (!y || !m || !d) return NaN;
  return Date.UTC(y, m - 1, d);
}

function dayDiffFromTodayIST(visitYmd) {
  const today = istTodayYmd();
  const a = ymdToUtcMs(today);
  const b = ymdToUtcMs(visitYmd);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

function formatPrettyDate(visitYmd) {
  const [y, m, d] = String(visitYmd)
    .split('-')
    .map((n) => parseInt(n, 10));
  if (!y || !m || !d) return visitYmd;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/** WhatsApp: *bold* ; monospace block ```...``` — strip chars that break formatting */
function waSafeText(s) {
  return String(s ?? '')
    .trim()
    .replace(/\*/g, '·')
    .replace(/`/g, "'");
}

function buildCustomerVisitWhatsAppText({
  customerName,
  visitYmd,
  visitTime,
  brandLine = 'Eleczio'
}) {
  const name = waSafeText(customerName || 'Sir/Madam') || 'Sir/Madam';
  const timeStr = waSafeText(visitTime) || '—';
  const brand = waSafeText(brandLine) || 'Eleczio';
  const datePretty = formatPrettyDate(visitYmd);
  const diff = dayDiffFromTodayIST(visitYmd);

  const dayWord =
    diff === 0 ? 'aaj' : diff === 1 ? 'kal' : diff === 2 ? 'parso' : null;

  const whenLine =
    dayWord != null
      ? `Hum *${dayWord}* (*${datePretty}*) aapke ghar *service* ke liye aa rahe hain.`
      : `Hum *${datePretty}* ko aapke ghar *service* ke liye aa rahe hain.`;

  return (
    `Hello *${name}*,\n\n` +
    `*${brand}* — *visit update*\n\n` +
    `${whenLine}\n\n` +
    `*Samay* (lagbhag):\n\`\`\`${timeStr}\`\`\`\n\n` +
    `*Dhanyawad*,\n*${brand}*`
  );
}

/** Date from mongoose visitDate → YYYY-MM-DD (UTC calendar) */
function visitDateToYmd(date) {
  if (!date) return '';
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

module.exports = {
  buildCustomerVisitWhatsAppText,
  visitDateToYmd,
  istTodayYmd
};
