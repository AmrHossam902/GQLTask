/* eslint-disable no-multi-str */

/**
 * Interface for creating Db interface that handles products queries only
 * @param {{runQuery:Function, close:Function}} dbInterface
 * object that has direct interaction with the database,
 * returns an object containg some functions to interact with the database
 */
function ProductsModel(dbInterface) {
  this.db = dbInterface;
}

/**
 * function that adds a new product in the database
 * @param {string} name name of the product
 * @param {number} price email of the product
 * @param {number} userId Id of the user who owns the product
 * @returns {Promise<{insertId:number}>| Promise<{type:string, msg:string}>}
 * returns {insertId} incase of success,
 * returns {type, msg} in case of failure
 */
ProductsModel.prototype.addNewProduct = function(name, price, userId) {
  const query = 'insert into store.products(name, price, userId) values\
      (?, ?, ?);';
  return this.db.runQuery(query, [name, price, userId]);
};


/**
 * get all products of a specific user
 * @param {number} userId id of the user to search for his/ her products
 * @returns {Promise<Array<{id: number, name:string
 *             , price:number, iserId:number}>>|
 *         Promise<{type:string, msg:string}>}
 * returns an array of products filled or empty in case user has no products,
 * {type, msg} in case of error
 */
ProductsModel.prototype.getProducts = function(userId) {
  const query = 'select * from products where userId = ? order by price';
  return this.db.runQuery(query, [userId])
      .then( (result)=> {
        return result;
      });
};


/**
 * get all products of all users
 * @returns {Promise<Array<{id: number, name:string
 *             , price:number, iserId:number}>>|
 *         Promise<{type:string, msg:string}>}
 * returns an array of products filled or empty in case user has no products,
 * {type, msg} in case of error
 */
ProductsModel.prototype.getAllProducts = function() {
  const query = 'select * from products';
  return this.db.runQuery(query, [])
      .then( (result)=> {
        return result;
      });
};

module.exports.ProductsModel = ProductsModel;

