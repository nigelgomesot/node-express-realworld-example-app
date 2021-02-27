var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
var crypto = require('crypto')
var jwt = require('jsonwebtoken')
var secret = require('../config').secret
// mongoose.set('debug', true)

var UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, unique: true, required: [true, 'cannot be blank'], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true },
  email: { type: String, lowercase: true, unique: true, required: [true, 'cannot be blank'], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
  bio: String,
  image: String,
  hash: String,
  salt: String,
  favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
  following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
}, { timestamps: true } )

UserSchema.plugin(uniqueValidator, { message: 'is already taken' })

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}

UserSchema.methods.validPassword = function(password) {
  const hash =  crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')

  return this.hash === hash
}

UserSchema.methods.generateJWT = function() {
  const today = new Date()
  const exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, secret)
}

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image
  }
}

UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false
  }
}

UserSchema.methods.addFavorite = function(articleId) {
  if (this.favorites.indexOf(articleId) === -1) {
    this.favorites.push(articleId)
  }

  return this.save()
}

UserSchema.methods.removeFavorite = function(articleId) {
  if (this.favorites.indexOf(articleId) !== -1)
    this.favorites.remove(articleId)

  return this.save()
}

UserSchema.methods.isFavorite = function(articleId) {
  return this.favorites.some((favoriteArticledId) => {
    return favoriteArticledId.toString() === articleId.toString()
  })
}

UserSchema.methods.follow = function(otherUserId) {
  if (this.following.indexOf(otherUserId) === -1) {
    this.following.push(otherUserId)

    return this.save()
  }
}

UserSchema.methods.unFollow = function(otherUserId) {
  if (this.following.indexOf(otherUserId) != -1) {
    this.following.remove(otherUserId)

    return this.save()
  }
}

UserSchema.methods.isFollowing = function(otherUserId) {
  return this.following.some(followId => {
    return followId.toString() === otherUserId.toString()
  })
}


mongoose.model('User', UserSchema)
