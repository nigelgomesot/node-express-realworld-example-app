var mongoose = require('mongoose')
var router = require('express').Router()
var passport = require('passport')

var User = mongoose.model('User')
var auth = require('../auth')

// Create user profile
router.post('/users', (req, res, next) => {
  const user = new User()

  user.username = req.body.user.username
  user.email = req.body.user.email
  user.setPassword(req.body.user.password)

  user.save().then(() => {
    return res.json({ user: user.toAuthJSON() })
  }).catch(next)
})

// Login user
router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email)
    return res.status(422).json({errors: {email: 'cannot be blank'}})

  if (!req.body.user.password)
    return res.status(422).json({errors: {password: 'cannot be blank'}})

  passport.authenticate('local', {session: false}, function(err, user, info) {
    if (err)
      return next(err)

    if (user) {
      user.token = user.generateJWT()

      return res.json({user: user.toAuthJSON()})
    } else {
      return res.status(422).json(info)
    }
  })(req, res, next)
})


// Get user profile
router.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    return res.json({ user: user.toAuthJSON() })
  }).catch(next)
})

// Update user profile
router.put('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    if (typeof req.body.user.username !== 'undefined')
      user.username = req.body.user.username

    if (typeof req.body.user.email !== 'undefined')
      user.email = req.body.user.email

    if (typeof req.body.user.password !== 'undefined')
      user.setPassword(req.body.user.password)

    if (typeof req.body.user.bio !== 'undefined')
      user.bio = req.body.user.bio

    if (typeof req.body.user.image !== 'undefined')
      user.image = req.body.user.image

    return user.save().then(() => res.json({ user: user.toAuthJSON() }))
  }).catch(next)
})

module.exports = router
