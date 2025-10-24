const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { presignGet } = require('../src/s3')
const mongoose = require('mongoose')
const Post = require('../models/Posts')

const authenticateToken = (req, res, next) => {
    let token = null
    const h = req.headers.authorization
    if (h.toLowerCase().startsWith('bearer')) {
        token = h.slice(7).trim()
    }
    if (req.cookies?.token) token = req.cookies.token
    if (!token) return res.status(401).json({ message: '토큰 없음' })
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return res.status(403).json({ message: '유효하지 않은 토큰' })
    }
}

const ensureObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: '잘못된 id' })
    }
    next()
}

const pickDefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))


router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, fileUrl = [], imageUrl } = req.body
        if (typeof fileUrl === 'string') {
            try {
                fileUrl = JSON.parse(fileUrl)
            } catch (error) {
                fileUrl = [fileUrl]
            }
        }
        const latest = await Post.findOne().sort({ number: -1 })
        const nextNumber = latest ? latest.number + 1 : 1
        const post = await Post.create({
            user: req.user._id || req.user.id,
            number: nextNumber,
            title,
            content,
            fileUrl,
            imageUrl
        })
        res.status(201).json(post)
    } catch (error) {
        console.error('Post /api/posts failed', error)
        res.status(500).json({ message: '서버 오류 발생' })
    }
})

router.get('/', async (req, res) => {
    try {
        const list = await Post.find().sort({ createdAt: -1 }).lean()
        const data = await Promise.all(
            list.map(async (p) => {
                const arr = Array.isArray(p.fileUrl) ? p.fileUrl : (p.imageUrl ? [p.imageUrl] : [])
                const urls = await Promise.all(
                    arr.map(async (v) => (v?.startsWith('http') ? v : await presignGet(v, 3600)))
                )
                return { ...p, fileUrl: urls }
            })
        )
        res.json(data)
    } catch (error) {
        console.error('Get /api/posts failed', error)
        res.status(500).json({ message: 'server error' })
    }
})

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id
        if (!userId) return res.status(400).json({ message: 'suer 정보 없음' })
        const myPosts = await Post.find({ user: userId }).sort({ createdAt: -1 }).lean()
        res.json(myPosts)
    } catch (error) {
        console.error('Get /api/posts/my failed', error)
        res.status(500).json({ message: 'server error' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const doc = await Post.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: '존재하지 않음' })
        res.json(doc)
    } catch (error) {
        console.error('Get /api/posts/my failed', error)
        res.status(500).json({ message: 'server error' })
    }
})

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, fileUrl, imageUrl } = req.body
        const updates = pickDefined({ title, content, fileUrl, imageUrl })
        const updated = await Post.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
        if (!updated) return res.status(404).json({ message: '존재하지 않음' })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ message: 'server error' })
    }
})

router.delete('/:id', authenticateToken, ensureObjectId, async (req, res) => {
    try {
        const deleted = await Post.findByIdAndUpdate(req.params.id)
        if (!deleted) return res.status(404).json({ message: '존재하지 않음' })
        res.json({ ok: true, id: deleted._id })
    } catch (error) {
        res.status(500).json({ message: 'server error' })
    }
})

module.exports = router