const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/auth');
const adminAuth = require('../controllers/adminAuth.controller');
const admin = require('../controllers/admin.controller');

router.get('/login', adminAuth.getLogin);
router.post('/login', adminAuth.postLogin);
router.get('/logout', adminAuth.logout);

router.use(requireAdmin);

router.get('/', admin.dashboard);

router.get('/settings', admin.getSettings);
router.post('/settings', admin.postSettings);

router.get('/services', admin.getServices);
router.post('/services', admin.postServiceCreate);
router.get('/services/:id/edit', admin.getServiceEdit);
router.post('/services/:id', admin.postServiceUpdate);
router.post('/services/:id/delete', admin.postServiceDelete);

router.get('/members', admin.getMembers);
router.post('/members', admin.postMemberCreate);
router.get('/members/:id/edit', admin.getMemberEdit);
router.post('/members/:id', admin.postMemberUpdate);
router.post('/members/:id/delete', admin.postMemberDelete);

router.get('/notifications', admin.getNotifications);
router.post('/notifications', admin.postNotificationCreate);
router.get('/notifications/:id/edit', admin.getNotificationEdit);
router.post('/notifications/:id', admin.postNotificationUpdate);
router.post('/notifications/:id/delete', admin.postNotificationDelete);

router.get('/requests', admin.getRequests);
router.get('/requests/:id', admin.getRequestDetail);
router.post('/requests/:id/schedule', admin.postRequestSchedule);
router.post('/requests/:id/mark-sent', admin.postRequestMarkSent);
router.post('/requests/:id/status', admin.postRequestStatus);

module.exports = router;
