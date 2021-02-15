const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const slug = require('slug')

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
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

mongoose.model('Article', ArticleSchema)

