const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');

const { attachUserFromToken } = require('./middlewares/auth');
const { languageMiddleware } = require('./middlewares/language');
const { indiaTelHref, indiaTelLabel } = require('./utils/indiaPhone');

const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.set('layout', 'layouts/admin');

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.use(expressLayouts);
app.use(cookieParser());
app.use(languageMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(attachUserFromToken);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.indiaTelHref = indiaTelHref;
  res.locals.indiaTelLabel = indiaTelLabel;
  next();
});

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('errors/404', {
    layout: false,
    title: 'Page Not Found'
  });
});

module.exports = app;
