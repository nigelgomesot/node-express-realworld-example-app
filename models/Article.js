const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slug = require('slug')
const User = mongoose.model('User')

var ArticleSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  tagList: [{type: String}],
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true})

ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'})

ArticleSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}

ArticleSchema.pre('validate', function(next) {
  if (!this.slug)
    this.slugify()

  next()
})

ArticleSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    favoritesCount: this.favoritesCount,
    tagList: this.tagList,
    author: this.author.toProfileJSONFor(user),
    favorited: user ? user.isFavorite(this._id) : false,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

ArticleSchema.methods.updateFavoriteCount = function() {
  const article = this

  return User.count({favorites: {$in: [article._id]}}).then(count => {
    article.favoritesCount = count

    return article.save()
  })
}

mongoose.model('Article', ArticleSchema)
