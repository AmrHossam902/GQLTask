const express = require('express');
const { schema } = require('./Schema/schema');
const PORT = 5555;

const { graphqlHTTP } = require("express-graphql");
const fs = require("fs");
let { jwtSecret } = JSON.parse( fs.readFileSync("./keys/keys.json").toString("utf-8") );

const jwt = require("jsonwebtoken");
var app = express();


app.use(function prepareCookies(req, res, next){
    req.cookies = new Object();
    if(req.headers["cookie"]){
        let cookiesStr = req.headers["cookie"];
        let cookiesArr = cookiesStr.split(";");
        cookiesArr.forEach(function(cookie){
            cookie = cookie.trim();
            let [key, value] = cookie.split("=");
            req.cookies[key] = value;
        });
    }
  
    next();
});

app.use(function authorize(req, res, next){
    
    if(req.cookies["token"]){
        jwt.verify(req.cookies["token"], jwtSecret, function(err, decoded){
            if(!err){
                req.userId=decoded.id;
            }
            next();
        });
    }
    else
        next();    
});

app.use("/graphql", graphqlHTTP(
    ()=>({
    'schema': schema,
    'graphiql' : true,
    customFormatErrorFn(err){
        return {
            message: err.message,
            type: ( err.originalError && err.originalError.name) || err.name,
            locations: err.locations,
             path: err.path
          };
    }
})));


app.listen(PORT);