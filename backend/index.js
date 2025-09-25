const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes.js')

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: '2mb' }))

app.get('/', (req, res) => {
    res.send('photo meno')
})

app.use('/api/auth', authRoutes)

app.use((req, res) => {
    res.status(500).json({ message: '서버 오류' })
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB 연결 성공'))
    .catch((err) => console.error('MongoDB 연결 실패:', err.message))

app.listen(PORT, () => {
    console.log(`🚀 Server is running ≫ http://localhost:${PORT}`)
})