const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');
const seoController = require('../controllers/seo.controller');
const { uploadComplaintImages } = require('../middlewares/uploadComplaintImages');

router.get('/robots.txt', seoController.getRobotsTxt);
router.get('/sitemap.xml', seoController.getSitemapXml);

router.get('/lang/:code', (req, res) => {
  const code = req.params.code === 'en' ? 'en' : 'hi';
  res.cookie('site_lang', code, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  });
  const back = req.get('Referer') || '/';
  res.redirect(back);
});

router.get('/', publicController.getHome);
router.get('/about', publicController.getAbout);
router.get('/services', publicController.getServicesPage);
router.get('/services/:slug', publicController.getServiceBySlug);
router.get('/contact', publicController.getContact);
router.post(
  '/service-request',
  uploadComplaintImages,
  publicController.postServiceRequest
);

module.exports = router;
