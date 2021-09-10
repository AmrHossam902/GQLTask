'use strict';
const express = require("express");
const PORT = 5555;
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLNonNull, GraphQLSchema, GraphQLList } = require("graphql");
const { graphqlHTTP } = require("express-graphql");
const fs = require("fs");
let { jwt_secret, password_secret } = JSON.parse( fs.readFileSync("./keys/keys.json").toString("utf-8") );
const { MySqlInterface : DB } = require("./Model");
const { validateEmail, validatePassword, validateName} = require("./validate");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

var app = express();

function throwError(type, msg){
    let err = new Error(msg);
    err.name = type;
    throw err;
}

var userType = new GraphQLObjectType({
    "name" : "userType",
    "fields" : ()=> ({
        "id": { "type" : GraphQLNonNull(GraphQLInt)  },
        "name" : { "type" : GraphQLNonNull(GraphQLString) },
        "email" : { "type" : GraphQLNonNull(GraphQLString) },
        "password" : { "type" : GraphQLNonNull(GraphQLString) },
        "products" : {
            "type" : GraphQLList(productType),
            "resolve" : async function(parent, args, context){

                if(! context.userId)
                    throwError("AUTHORIZATION_ERROR", "you're not authorized for this operation, please log in first");
                
                    let result = await DB.getProducts(parent.id);

                    if(result.type && result.msg){
                        throwError(result.type, result.msg);
                    }
                    else
                        return result;   
            }
        } 
    })
});

var productType = new GraphQLObjectType({
    "name" : "productType",
    "fields" : ()=>({
        "id" : { "type" : GraphQLNonNull(GraphQLInt) },
        "name" : { "type" : GraphQLNonNull(GraphQLString) },
        "price" : { "type" : GraphQLNonNull(GraphQLFloat) },
        "seller" : { 
            "type" : userType,
            "resolve" : async function(parent){
                
                let result = await DB.getUserById(parent.userId);
                
                if(result.type && result.msg)
                    throwError(result.type, result.msg);
                else{
                    return result;
                }

            } 
        }
    })
});

var query = new GraphQLObjectType({
    "name" : "queryObject",
    "fields" : { 
        "login" : {
            "type" : userType,
            "args" : {
                "email" : { "type" : GraphQLNonNull(GraphQLString) },
                "password" : { "type" : GraphQLNonNull(GraphQLString) }
            },
            "resolve" : async function(parent, args, context){
                let email = args.email;
                let password = args.password;

                
                let cryptoPassword = crypto.createHmac("sha256", password_secret).update(password).digest("hex");
                let result = await DB.getUserByEmail(email);

                if(result){
                    if(result.type && result.msg)
                        throwError(result.type, result.msg);
                    else if(cryptoPassword == result.password){
                        
                        //set jwt here
                        let token = jwt.sign({"id" : result.id}, jwt_secret, { "expiresIn" : '1h'});
                        context.res.cookie("token", token, {"httpOnly": true});
                        context.id = result.id;
                        return result;
                    }
                    else
                        throwError("AUTHENTICATION_ERROR", "incorrect email or password");
                }
                else{
                    throwError("AUTHENTICATION_ERROR", "incorrect email or password");

                }

            }
        },
        "getAllProducts" : {
            "type" : GraphQLList(productType),
            "resolve" : async function(parent, args, context){
                
                if(! context.userId)
                    throwError("AUTHORIZATION_ERROR", "you're not authorized for this operation, please log in first");

                let results = await DB.getAllProducts();

                if(results.type && results.msg){
                    throwError(results.type, results.msg);
                }
                else
                    return results;  
            }
        },
        "getUserProducts" : {
            "type" : GraphQLList(productType),

            "resolve" : async function(parent, args, context){

                if(! context.userId)
                    throwError("AUTHORIZATION_ERROR", "you're not authorized for this operation, please log in first");

                let results = await DB.getProducts(context.userId);

                if(results.type && results.msg){
                    throwError(results.type, results.msg);
                }
                else
                    return results;                    
            }
        }
    }
});

var mutation = new GraphQLObjectType({
    "name" : "mutationObject",
    "fields" : {
        "register" : {
            "type" : userType,
            "args" : {
                "name" : { "type" : GraphQLNonNull(GraphQLString) },
                "email" : { "type" : GraphQLNonNull(GraphQLString) },
                "password" : { "type" : GraphQLNonNull(GraphQLString) },
                "confirmPassword" : { "type" : GraphQLNonNull(GraphQLString) }
            },
            "resolve" : async function(parent, args, context){
                
                let name = args.name;
                let email = args.email;
                let password = args.password;
                let confirmPassword = args.confirmPassword;

                let result = validateName(name);
                if(!result.OK)
                    throwError(result.type, result.msg);

                result = validateEmail(email);
                if(!result.OK)
                    throwError(result.type, result.msg);
                
                result = validatePassword(password, confirmPassword);
                if(!result.OK)
                    throwError(result.type, result.msg);
                
                //digest password
                let cryptoPassword  = crypto.createHmac("sha256", password_secret).update(password).digest("hex");

                console.log(cryptoPassword);
                result = await DB.addNewUser(name, email, cryptoPassword);
                
                if(result.insertId){
                    context.id = result.insertId;
                    return {
                        "id" : result.insertId,
                        "name" : args.name,
                        "email" : args.email,
                        "password" : args.password
                    };
                }  
                else{
                    throwError(result.type, result.msg);
                }
            }
        },
        "addProduct" : {
            "type" : productType,
            "args" : {
                "name" : { "type" : GraphQLNonNull(GraphQLString) },
                "price" : { "type" : GraphQLNonNull(GraphQLFloat) }
            },
            "resolve" : async function(parent, args, context){

                if(! context.userId)
                    throwError("AUTHORIZATION_ERROR", "you're not authorized for this operation, please log in first");
                
                let name = args.name;
                let price = args.price;

                let result = validateName(name);
                if(!result.OK)
                    throwError(result.type, result.msg);
                
                result = await DB.addNewProduct(name, price, Number(context.userId));
 
            
                if(result.insertId)
                    return {
                        "id" : result.insertId,
                        "name" : args.name,
                        "price" : args.price
                    };
                else{
                    throwError(result.type, result.msg);
                }
            }
        }
    } 
});

var schema = new GraphQLSchema({
    "query" : query,
    "mutation" : mutation
});

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
        jwt.verify(req.cookies["token"], jwt_secret, function(err, decoded){
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
          //   locations: err.locations,
             path: err.path
          };
    }
})));


app.listen(PORT);