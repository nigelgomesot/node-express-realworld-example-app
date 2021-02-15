var router = require('express').Router()
var passport = require('passport')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var Article = mongoose.model('Article')
var auth = require('../auth')

// Create article
router.post('/', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    const article = new Article(req.body.article)

    article.author = user

    return article.save().then(() => {
      console.log(`article created for author: ${article.author}`)

      return res.json({article: article.toJSONFor(user)})
    })
  }).catch(next)
})

router.param('article', (req, res, next, slug) => {
  Article.findOne({slug: slug})
    .populate('author')
    .then(article => {
      if (!article)
        return res.sendStatus(404)

        req.article = article
        console.log(`article found for author: ${req.article.author}`)

        return next()
    }).catch(next)
})

// Get article
router.get('/:article', auth.optional, (req, res, next) => {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate('author').execPopulate()
  ]).then(results => {
    const user = results[0]

    return res.json({article: req.article.toJSONFor(user)})
  }).catch(next)
})

module.exports = router
