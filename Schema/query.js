
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} = require('graphql');
const {throwError} = require('../error');
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');
const {passwordSecret, jwtSecret} =JSON.parse(fs.readFileSync(
    path.resolve(__dirname + '/../keys/keys.json')).toString('utf-8'));
const jwt = require('jsonwebtoken');

/**
 * return query object
 * with the following capabilities
 * 1- login
 * 2- get all products for a specific user
 * 3- get all products for all users
 * @param {object} users the database interfacing object for users type
 * @param {object} products the database interfacing object for prodcuts type
 * @param {object} userType object defining a type for user in schema
 * @param {object} productType object defining a type for product in schema
 * @return {object} Query object
 */
function Query(users, products, userType, productType) {
  return new GraphQLObjectType({
    name: 'queryObject',
    fields: {
      login: {
        type: userType,
        args: {
          email: {type: new GraphQLNonNull(GraphQLString)},
          password: {type: new GraphQLNonNull(GraphQLString)},
        },
        resolve: async function(parent, args, context) {
          const email = args.email;
          const password = args.password;

          const cryptoPassword = crypto.createHmac('sha256',
              passwordSecret).update(password).digest('hex');
          const result = await users.getUserByEmail(email);

          if (! result ||
            ( result.password && cryptoPassword !== result.password)) {
            throwError('AUTHENTICATION_ERROR", "incorrect email or password');
          }

          if (result.type && result.msg) {
            throwError(result.type, result.msg);
          }

          const token = jwt.sign({id: result.id},
              jwtSecret, {expiresIn: '1h'});
          context.res.cookie('token', token, {'httpOnly': true});
          context.id = result.id;
          return result;
        },
      },
      getAllProducts: {
        type: new GraphQLList(productType),
        resolve: async function(parent, args, context) {
          if (! context.userId) {
            throwError('AUTHORIZATION_ERROR',
                'you\'re not authorized for this operation, please log in');
          }

          const results = await products.getAllProducts();

          if (results.type && results.msg) {
            throwError(results.type, results.msg);
          }
          return results;
        },
      },
      getUserProducts: {
        type: new GraphQLList(productType),
        resolve: async function(parent, args, context) {
          if (! context.userId) {
            throwError('AUTHORIZATION_ERROR',
                'you\'re not authorized for this operation, please log in');
          }

          const results = await products.getProducts(context.userId);

          if (results.type && results.msg) {
            throwError(results.type, results.msg);
          }

          return results;
        },
      },
    },
  });
}


module.exports.Query = Query;
