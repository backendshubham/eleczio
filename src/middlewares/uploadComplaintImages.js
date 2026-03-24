const multer = require('multer');

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 3 },
  fileFilter(req, file, cb) {
    if (ALLOWED.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_IMAGE_TYPE'));
    }
  }
});

const arrayMiddleware = upload.array('images', 3);

function uploadComplaintImages(req, res, next) {
  arrayMiddleware(req, res, (err) => {
    if (!err) return next();
    const lang = req.cookies?.site_lang === 'hi' ? 'hi' : 'en';
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const msg =
          lang === 'en'
            ? 'Each photo must be 5MB or smaller.'
            : 'Har photo 5MB se chhoti honi chahiye.';
        return res.status(400).json({ ok: false, error: msg });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const msg =
          lang === 'en'
            ? 'Too many files — max 3 photos.'
            : 'Zyada files — max 3 photos.';
        return res.status(400).json({ ok: false, error: msg });
      }
    }
    if (err.message === 'INVALID_IMAGE_TYPE') {
      const msg =
        lang === 'en'
          ? 'Only JPG, PNG or WebP images are allowed.'
          : 'Sirf JPG, PNG ya WebP images.';
      return res.status(400).json({ ok: false, error: msg });
    }
    const msg =
      lang === 'en' ? 'Upload failed — try again.' : 'Upload fail — dubara try karein.';
    return res.status(400).json({ ok: false, error: msg });
  });
}

module.exports = { uploadComplaintImages };
