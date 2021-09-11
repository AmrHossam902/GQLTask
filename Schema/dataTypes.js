const {throwError} = require('../error');

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLList,
} = require('graphql');



function getDataTypes(users, products) {

    const productType =  new GraphQLObjectType({
        name: 'productType',
        fields: ()=>({
          id: {type: new GraphQLNonNull(GraphQLInt)},
          name: {type: new GraphQLNonNull(GraphQLString)},
          price: {type: new GraphQLNonNull(GraphQLFloat)},
          seller: {
            type: userType,
            resolve: async function(parent) {
              const result = await users.getUserById(parent.userId);
    
              if (result.type && result.msg) {
                throwError(result.type, result.msg);
              }
              return result;
            },
          },
        }),
      });
    
    const userType = new GraphQLObjectType({
        name: 'userType',
        fields: ()=> ({
          id: {type: new GraphQLNonNull(GraphQLInt)},
          name: {type: new GraphQLNonNull(GraphQLString)},
          email: {type: new GraphQLNonNull(GraphQLString)},
          password: {type: new GraphQLNonNull(GraphQLString)},
          products: {
            type: new GraphQLList(productType),
            resolve: async function(parent, args, context) {
              if (! context.userId) {
                throwError('AUTHORIZATION_ERROR',
                    'you\'re not authorized for this operation, please log in');
              }
              const result = await products.getProducts(parent.id);
              if (result.type && result.msg) {
                throwError(result.type, result.msg);
              } else {
                return result;
              }
            },
          },
        }),
      });

    return { productType, userType };
}

module.exports.getDataTypes = getDataTypes;
