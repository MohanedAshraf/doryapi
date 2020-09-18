import crypto from 'crypto'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['google', 'local', 'facebook'],
    required: true
  },
  local: {
    name: {
      type: String
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      select: false
    }
  },
  google: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  facebook: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },

  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },

  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  dob: {
    type: Date,
    alias: 'birthdate'
  }
})

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('local.password') || this.method !== 'local') {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.local.password = await bcrypt.hash(this.local.password, salt)
})

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.local.password)
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken
}

export default mongoose.model('User', UserSchema)
