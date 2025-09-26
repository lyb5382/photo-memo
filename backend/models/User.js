const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, lowarcase: true, trim: true, match: [EMAIL_REGEX, '유효 이메일'] },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    isActive: { type: Boolean, default: true },
    isLogined: { type: Boolean, default: false },
    loginAttemp: { type: Number, default: 0 }
}, { timeseries: true })

userSchema.methods.comparePasswd = function (p) {
    return bcrypt.compare(p, this.passwordHash)
}

userSchema.methods.safeJSON = function () {
    const obj = this.toObject({ versionKey: false })
    delete obj.passwordHash
    return obj
}

userSchema.index({ email: 1 }, { unique: true })

module.exports = mongoose.model('User', userSchema)