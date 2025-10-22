const jwt = require('jsonwebtoken')

module.exports = function auth(req, res, next) {
    try {
        const h = req.headers.authorization || ''
        const token = h.startsWith('Bearer') ? h.slice(7) : (req.cookies?.token || null)
        if (!token) {
            return res.status(401).json({ message: '인증 필요' })
        }
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        return next()
    } catch (error) {
        return res.status(401).json({ message: '토큰 무효', error: error.message })
    }
}