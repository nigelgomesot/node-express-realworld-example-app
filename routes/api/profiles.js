var router = require('express').Router()
var mongoose = require('mongoose')
var User = mongoose.model('User')
var auth = require('../auth')

router.param('username', (req, res, next, username) => {
  User.findOne({username: username}).then(user => {
    if (!user)
      return res.sendStatus(404)

    req.profile = user

    return next()
  }).catch(next)
})


router.get('/:username', auth.optional, (req, res, next) => {
  if (req.payload) {
    User.findById(req.payload.id).then(user => {
      if (!user)
        return res.json({profile: req.profile.toProfileJSONFor(false)})
      else
        return res.json({profile: req.profile.toProfileJSONFor(user)})
    })
  } else
    return res.json({profile: req.profile.toProfileJSONFor(false)})
})

module.exports = router
