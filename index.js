const express = require('express');
const {schema} = require('./Schema/schema');
const PORT = 5555;

const {graphqlHTTP} = require('express-graphql');
const fs = require('fs');
const {jwtSecret} = JSON.parse(fs.readFileSync(
    './keys/keys.json').toString('utf-8') );

const jwt = require('jsonwebtoken');
const app = express();


app.use(function prepareCookies(req, res, next) {
  req.cookies = {};
  if (req.headers.cookie) {
    const cookiesStr = req.headers.cookie;
    const cookiesArr = cookiesStr.split(';');

    cookiesArr.forEach(function(cookie) {
      cookie = cookie.trim();
      const [key, value] = cookie.split('=');
      req.cookies[key] = value;
    });
  }
  next();
});

app.use(function authorize(req, res, next) {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, jwtSecret, function(err, decoded) {
      if (!err) {
        req.userId=decoded.id;
      }
      next();
    });
  } else {
    next();
  }
});

app.use('/graphql', graphqlHTTP(
    ()=>({
      schema,
      graphiql: true,
      customFormatErrorFn(err) {
        return {
          message: err.message,
          type: ( err.originalError && err.originalError.name) || err.name,
          locations: err.locations,
          path: err.path,
        };
      },
    }),
));

require('https').createServer({
  key: fs.readFileSync('./keys/localhost.key'),
  cert: fs.readFileSync('./keys/localhost.cert')
}, app).listen(PORT);


