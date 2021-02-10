var jwt = require('express-jwt')
var secret =  require('../config').secret

const getTokenFromHeader = req => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[1]
  }

  return null
}

var auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader,
    credentialsRequired: false
  })
}

module.exports = auth
