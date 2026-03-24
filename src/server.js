const dotenv = require('dotenv');

dotenv.config();

const { isS3Configured } = require('./services/s3Upload');
const connectDb = require('./config/db');
const { bootstrapData } = require('./services/bootstrap');
const app = require('./app');

const PORT = process.env.PORT || 3000;

connectDb()
  .then(() => bootstrapData())
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Eleczio server → http://localhost:${PORT}\nAdmin → http://localhost:${PORT}/admin/login`
      );
      console.log(
        isS3Configured()
          ? '[s3] Complaint photo uploads: ON'
          : '[s3] Complaint photo uploads: OFF — set BUG_IMAGES_BUCKET (or AWS_S3_BUCKET), AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env'
      );
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
