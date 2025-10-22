const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const auth = require('../middlewares/auth')

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
            return res.status(400).json({ message: '존재하지 않는 email' })
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
        return res.status(200).json({ user: updated.safeJSON(), token, loginAttemp: 0 })
    } catch (error) {
        return res.status(500).json({ message: 'failed', error: error.message })
    }
})

router.use(auth)
// 토큰 조회
router.get('/me', async (req, res) => {
    try {
        const me = await User.findById(req.user.id)
        if (!me) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
        }
        return res.status(200).json(me.safeJSON())
    } catch (error) {
        return res.status(500).json({ message: '사용자 정보 조회 실패', error: error.message })
    }
})
// 관리자 조회
router.get('/users', async (req, res) => {
    try {
        const me = await User.findById(req.user.id)
        if (!me) return res.status(404).json({ message: '사용자 없음' })
        if (me.role !== 'admin') {
            return res.status(403).json({ message: '권한 없음' })
        }
        const users = await User.find().select('-passwordHash')
        return res.status(200).json({ users })
    } catch (error) {
        res.status(401).json({ message: "조회 실패", error: error.message })
    }
})
// 로그아웃
router.post('/logout', async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            { $set: { isLoggined: false } },
            { new: true }
        )
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: 'production'
        })
        return res.status(200).json({ message: '로그아웃 성공' })
    } catch (error) {
        return res.status(500).json({ message: '로그아웃 실패', error: error.message })
    }
})

module.exports = router