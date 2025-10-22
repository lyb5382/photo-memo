const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { presignPut } = require('../src/s3')

router.get('/ping', (req, res) => res.json({ ok: true }))

router.post('/presign', async (req, res) => {
    try {
        const { filename, contentType } = req.body
        if (!filename || !contentType) return res.status(400).json({ message: 'undefined filename&contentType' })
        const key = `uploads/${Date.now()}-${uuidv4()}${path.extname(filename)}` || ''
        const url = await presignPut(key, contentType)
        res.json({ url, key })
    } catch (error) {
        console.error('presign failed', error)
        res.status(500).json({ message: 'presign created failed' })
    }
})

module.exports = router