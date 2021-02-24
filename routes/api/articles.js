var router = require('express').Router()
var passport = require('passport')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var Article = mongoose.model('Article')
var Comment = mongoose.model('Comment')
var auth = require('../auth')

// Create article
router.post('/', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    const article = new Article(req.body.article)

    article.author = user

    return article.save().then(() => {
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

// Update article
router.put('/:article', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== 'undefined')
        req.article.title = req.body.article.title

      if (typeof req.body.article.description !== 'undefined')
        req.article.description = req.body.article.description

      if (typeof req.body.article.body !== 'undefined')
        req.article.body = req.body.article.body

      req.article.save().then(article => res.json({article: article.toJSONFor(user)})
      ).catch(next)
    } else {
      return res.sendStatus(403)
    }
  })
})

// Delete article
router.delete('/:article', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(() => {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      return req.article.remove().then(() => {
        return res.sendStatus(204)
      })
    } else {
      return res.sendStatus(403)
    }
  })
})

// Favorite article
router.post('/:article/favorite', auth.required, (req, res, next) => {
  const articleId = req.article._id

  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    return user.addFavorite(articleId).then(() => {
      return req.article.updateFavoriteCount().then(article => {
        return res.json({article: article.toJSONFor(user)})
      })
    })
  }).catch(next)
})

// UnFavorite article
router.delete('/:article/favorite', auth.required, (req, res, next) => {
  const articleId = req.article._id

  User.findById(req.payload.id).then(user => {
    if (!user)
      return res.sendStatus(401)

    return user.removeFavorite(articleId).then(() => {
        return req.article.updateFavoriteCount().then(article => {
          return res.json({article: article.toJSONFor(user)})
        })
    })
  }).catch(next)
})

// Add comment
router.post('/:article/comments', auth.required, (req, res, next) => {
  User.findById(req.payload.id).then(user => {
    if (!user)
      res.sendStatus(401)

    const comment = new Comment(req.body.comment)
    comment.article = req.article
    comment.author = user

    return comment.save().then(() => {
      req.article.comments.push(comment)

      return req.article.save().then(article => {
        res.json({comment: comment.toJSONFor(user)})
      })
    })
  }).catch(next)
})


module.exports = router
