const { pick } = require('../utils/i18n');

const UI = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navServices: 'Services',
    navComplaint: 'Complaint',
    navContact: 'Contact',
    callNow: 'Call Now',
    callHero: 'Call us now',
    bookService: 'Book service',
    scroll: 'Scroll',
    sectionAboutBadgeElec: 'Electrical',
    sectionAboutBadgeElecSub: 'Experts',
    sectionAboutBadgeEltr: 'Electronics',
    sectionAboutBadgeEltrSub: 'Repair',
    sectionAboutBadgeHome: 'Home',
    sectionAboutBadgeHomeSub: 'Services',
    formName: 'Your name',
    formPhone: 'Phone number',
    formAddress: 'Your address',
    formProblem: 'Problem description',
    formSubmit: 'Submit request',
    formPlaceholderName: 'e.g. Rahul Sharma',
    formPlaceholderPhone: '10-digit mobile',
    formPlaceholderAddress: 'Area, Khandwa',
    formPlaceholderProblem: 'Describe the issue…',
    formPhotosOptional: 'Photos (optional)',
    uploadPhotosCta: 'Add photos',
    uploadPhotosHint: 'Up to 3 — JPG, PNG or WebP · max 5 MB each',
    uploadPhotosSub: 'Helps us see the fault before we visit.',
    alertFillAll: 'Please fill all fields.',
    alertPhone: 'Enter a valid 10-digit number.',
    alertImageType: 'Only JPG, PNG or WebP images.',
    alertImageSize: 'Each photo must be 5 MB or smaller.',
    alertMaxPhotos: 'You can add at most 3 photos.',
    alertNetwork: 'Network error — check your connection.',
    toastOk: 'Request received — we will contact you soon.',
    langSwitchTo: 'Hinglish',
    langCurrent: 'English',
    footerHeadLinks: 'Quick links',
    footerHeadContact: 'Contact us',
    rightsLine: 'All rights reserved.'
  },
  hi: {
    navHome: 'Home',
    navAbout: 'About',
    navServices: 'Services',
    navComplaint: 'Complaint',
    navContact: 'Contact',
    callNow: 'Abhi call karein',
    callHero: 'Abhi call karo',
    bookService: 'Service book karein',
    scroll: 'Neeche scroll',
    sectionAboutBadgeElec: 'Electrical',
    sectionAboutBadgeElecSub: 'Experts',
    sectionAboutBadgeEltr: 'Electronics',
    sectionAboutBadgeEltrSub: 'Repair',
    sectionAboutBadgeHome: 'Home',
    sectionAboutBadgeHomeSub: 'Services',
    formName: 'Aapka naam',
    formPhone: 'Phone number',
    formAddress: 'Aapka address',
    formProblem: 'Problem detail',
    formSubmit: 'Complaint submit karein',
    formPlaceholderName: 'Jaise: Rahul Sharma',
    formPlaceholderPhone: '10-digit mobile',
    formPlaceholderAddress: 'Gali, mohalla, Khandwa',
    formPlaceholderProblem: 'Problem detail me likhein…',
    formPhotosOptional: 'Photos (optional)',
    uploadPhotosCta: 'Photos add karein',
    uploadPhotosHint: 'Max 3 — JPG, PNG ya WebP · har ek 5 MB tak',
    uploadPhotosSub: 'Fault dekhne me help hoti hai visit se pehle.',
    alertFillAll: 'Kripya sabhi fields fill karein!',
    alertPhone: 'Valid 10-digit number enter karein!',
    alertImageType: 'Sirf JPG, PNG ya WebP.',
    alertImageSize: 'Har photo 5 MB se chhoti honi chahiye.',
    alertMaxPhotos: 'Sirf 3 photos tak.',
    alertNetwork: 'Network error — connection check karein.',
    toastOk: 'Request mil gayi — hum jald contact karenge.',
    langSwitchTo: 'English',
    langCurrent: 'Hinglish',
    footerHeadLinks: 'Quick links',
    footerHeadContact: 'Contact karein',
    rightsLine: 'All rights reserved.'
  }
};

function languageMiddleware(req, res, next) {
  let lang = req.cookies?.site_lang;
  if (lang !== 'en' && lang !== 'hi') lang = 'en';
  res.locals.lang = lang;
  res.locals.t = (v) => pick(v, lang);
  res.locals.ui = UI[lang];
  res.locals.langOther = lang === 'en' ? 'hi' : 'en';
  next();
}

module.exports = { languageMiddleware, UI };
