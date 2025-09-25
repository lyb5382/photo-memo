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

router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'email, 비밀번호 필수 입력' })
        }
        const exists = await User.findOne({
            email: email.toLowerCase()
        })
        if (exists) {
            return res.status(400).json({ message: '이미 가입한 email' })
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const validRoles = ['user', 'admin']
        const safeRole = validRoles.includes(role) ? role : 'user'
        const user = await User.create({ email, displayName, passwordHash, role: safeRole })
        res.status(201).json({ user: user.safeJSON() })
    } catch (error) {
        res.status(404).json({ message: 'failed', error: error.message })
    }
})

module.exports = router