var mongoose = require('mongoose')
var router = require('express').Router()
var passport = require('passport')

var User = mongoose.model('User')
var auth = require('../auth')

// Get user profile
router.get('/user', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    return res.json({ user: user.toAuthJSON() })
  }).catch(next)
})

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


// Pending:
// put '/user'
// post '/users/login'

module.exports = router
