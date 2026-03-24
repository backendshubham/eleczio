const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

function cleanEnv(name) {
  const v = process.env[name];
  if (v == null) return '';
  return String(v)
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function getS3Config() {
  return {
    accessKeyId: cleanEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: cleanEnv('AWS_SECRET_ACCESS_KEY'),
    bucket:
      cleanEnv('BUG_IMAGES_BUCKET') ||
      cleanEnv('AWS_S3_BUCKET') ||
      cleanEnv('S3_BUCKET'),
    region:
      cleanEnv('AWS_REGION') || cleanEnv('AWS_DEFAULT_REGION')
  };
}

function isS3Configured() {
  const c = getS3Config();
  return !!(
    c.accessKeyId &&
    c.secretAccessKey &&
    c.bucket &&
    c.region
  );
}

function getS3Client() {
  const c = getS3Config();
  return new S3Client({
    region: c.region,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey
    }
  });
}

function extFromMime(contentType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  return map[contentType] || 'jpg';
}

function buildPublicUrl(bucket, region, key) {
  const base = cleanEnv('S3_PUBLIC_BASE_URL');
  if (base) {
    const b = base.replace(/\/$/, '');
    const k = key.replace(/^\//, '');
    return `${b}/${k}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function uploadComplaintImage(buffer, contentType) {
  if (!isS3Configured()) {
    throw new Error('S3_NOT_CONFIGURED');
  }
  const c = getS3Config();
  const ext = extFromMime(contentType);
  const month = new Date().toISOString().slice(0, 7);
  const key = `complaints/${month}/${crypto.randomUUID()}.${ext}`;
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: c.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000'
    })
  );
  const url = buildPublicUrl(c.bucket, c.region, key);
  return { url, key };
}

module.exports = {
  isS3Configured,
  getS3Config,
  uploadComplaintImage
};
