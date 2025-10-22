const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET']
const missing = required.filter(k => !process.env[k])

if (missing.length) console.error('[S3 ENV Missing]', missing)

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const Bucket = process.env.S3_BUCKET

async function presignPut(Key, ContentType, sec = 300) {
    if (!Bucket) throw new Error('S3 bucket is undefined')
    const cmd = new PutObjectCommand({ Bucket, Key, ContentType })
    return getSignedUrl(s3, cmd, { expiresIn: sec })
}

async function presignGet(Key, sec = 300) {
    if (!Bucket) throw new Error('S3 bucket is undefined')
    const cmd = new GetObjectCommand({ Bucket, Key })
    return getSignedUrl(s3, cmd, { expiresIn: sec })
}

module.exports = { s3, presignPut, presignGet, Bucket }