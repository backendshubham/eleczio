const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getLogin = (req, res) => {
  if (req.user && req.user.role === 'admin') {
    return res.redirect('/admin');
  }
  res.render('admin/login', {
    layout: false,
    title: 'Admin Login',
    error: null
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email: (email || '').trim().toLowerCase()
  });
  if (!user || user.role !== 'admin') {
    return res.render('admin/login', {
      layout: false,
      title: 'Admin Login',
      error: 'Galat email ya password'
    });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.render('admin/login', {
      layout: false,
      title: 'Admin Login',
      error: 'Galat email ya password'
    });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    })
    .redirect('/admin');
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};
