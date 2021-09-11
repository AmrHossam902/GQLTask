
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
} = require('graphql');
const {throwError} = require('../error');
const {validateEmail, validateName, validatePassword} = require('../validate');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {passwordSecret} =JSON.parse(fs.readFileSync(
    path.resolve(__dirname + '/../keys/keys.json')).toString('utf-8'));

/**
 * this function creates a Mutation object
 * whith the following capabilities,
 * 1- resgister users,
 * 2- create new products
 * @param {object} users the database interfacing object for users type
 * @param {object} products the database interfacing object for prodcuts type
 * @param {object} userType object defining a type for user in schema
 * @param {object} productType object defining a type for product in schema
 * @return {object} Mutation object
 */
function Mutation(users, products, userType, productType) {
  return new GraphQLObjectType({
    name: 'mutationObject',
    fields: {
      register: {
        type: userType,
        args: {
          name: {type: new GraphQLNonNull(GraphQLString)},
          email: {type: new GraphQLNonNull(GraphQLString)},
          password: {type: new GraphQLNonNull(GraphQLString)},
          confirmPassword: {type: new GraphQLNonNull(GraphQLString)},
        },
        resolve: async function(parent, args, context) {
          const name = args.name;
          const email = args.email;
          const password = args.password;
          const confirmPassword = args.confirmPassword;

          let result = validateName(name);
          if (!result.OK) {
            throwError(result.type, result.msg);
          }


          result = validateEmail(email);
          if (!result.OK) {
            throwError(result.type, result.msg);
          }

          result = validatePassword(password, confirmPassword);
          if (!result.OK) {
            throwError(result.type, result.msg);
          }

          // digest password
          const cryptoPassword = crypto.createHmac('sha256',
              passwordSecret).update(password).digest('hex');

          console.log(cryptoPassword);
          result = await users.addNewUser(name, email, cryptoPassword);

          if (result.type && result.msg) {
            throwError(result.type, result.msg);
          }

          context.id = result.insertId;

          return {
            id: result.insertId,
            name: args.name,
            email: args.email,
            password: args.password,
          };
        },
      },
      addProduct: {
        type: productType,
        args: {
          name: {type: new GraphQLNonNull(GraphQLString)},
          price: {type: new GraphQLNonNull(GraphQLFloat)},
        },
        resolve: async function(parent, args, context) {
          if (! context.userId) {
            throwError('AUTHORIZATION_ERROR',
                'you\'re not authorized for this operation, please log in');
          }

          const name = args.name;
          const price = args.price;

          let result = validateName(name);
          if (!result.OK) {
            throwError(result.type, result.msg);
          }

          result = await products.addNewProduct(name,
              price, Number(context.userId));

          if (result.type && result.msg) {
            throwError(result.type, result.msg);
          }

          return {
            id: result.insertId,
            name: args.name,
            price: args.price,
            userId: context.userId,
          };
        },
      },
    },
  });
}

module.exports.Mutation = Mutation;
