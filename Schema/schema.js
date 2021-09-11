
const {GraphQLSchema} = require('graphql');
const {UsersModel} = require('../Models/User/user');
const {ProductsModel} = require('../Models/Product/product');
const dbInterface = require('../Models/dbInterface').createInterface();
const {Query} = require('./query');
const {Mutation} = require('./mutation');


const users = new UsersModel(dbInterface);
const products = new ProductsModel(dbInterface);

const {productType, userType} =
  require('./dataTypes').getDataTypes(users, products);

const schema = new GraphQLSchema({
  query: new Query(users, products, userType, productType),
  mutation: new Mutation(users, products, userType, productType),
});

module.exports.schema = schema;
