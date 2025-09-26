const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')

function makeToken(u) {
    return jwt.sign(
        { id: u._id.toString(), role: u.role, email: u.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}
// 가입
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body
        if (!email || !password) return res.status(400).json({ message: 'email, 비밀번호 필수 입력' })
        const exists = await User.findOne({
            email: email.toLowerCase()
        })
        if (exists) return res.status(400).json({ message: '이미 가입한 email' })
        const passwordHash = await bcrypt.hash(password, 10)
        const validRoles = ['user', 'admin']
        const safeRole = validRoles.includes(role) ? role : 'user'
        const user = await User.create({ email, displayName, passwordHash, role: safeRole })
        res.status(201).json({ user: user.safeJSON() })
    } catch (error) {
        res.status(404).json({ message: 'failed', error: error.message })
    }
})
// 로긴
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'email, 비밀번호 필수 입력' })
        const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
        const passwd = await user.comparePasswd(password)
        if (!user) {
            return res.status(400).json({ message: 'email or 비밀번호 틀림' })
        }
        if (!passwd) {
            user.loginAttemp += 1
            if (user.loginAttemp >= 5) {
                user.isActive = false
                await user.save()
                return res.status(403).json({ message: '계정 잠김' })
            }
            await user.save()
            return res.status(400).json({ message: `email or 비밀번호 틀림, 틀린 횟수: ${user.loginAttemp}, 5회 이상 시 계정 잠금` })
        }
        const updated = await User.findByIdAndUpdate(
            user._id,
            { $set: { isLogined: true, loginAttemp: 0 } },
            { new: true }
        )
        if (!updated) return res.status(500).json({ message: '로그인 갱신 실패' })
        const token = makeToken(updated)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: 'production',
            maxAge: 7 * 25 * 60 * 60 * 1000
        })
        return res.status(200).json({ user: updated.safeJSON(), token })
    } catch (error) {
        return res.status(500).json({ message: 'failed', error: error.message })
    }
})

router.get('/me', async (req, res) => {
    try {
        const h = req.headers.authorization || ''
        const token = h.startsWith('Bearer') ? h.slice(7) : null
        if (!token) return res.status(401).json({ message: '인증 필요' })
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.id)
        if (!user) return res.status(404).json({ message: '유저 찾을 수 없음' })
        res.status(200).json(user.safeJSON())
    } catch (error) {
        return res.status(401).json({ message: '토큰 무효', error: error.message })
    }
})

module.exports = router