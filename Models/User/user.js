/* eslint-disable no-multi-str */

/**
 * Interface for creating Db interface that handles users queries only
 * @param {{runQuery:Function, close:Function}} dbInterface
 * object that has direct interaction with the database,
 * returns an object containg some functions to interact with the database
 */
function UsersModel(dbInterface) {
  this.db = dbInterface;
}

/**
 * function that adds a new user in the database
 * @param {string} name name of the user
 * @param {string} email email of the user
 * @param {string} password password of the user
 * @returns {Promise<{insertId:number}>| Promise<{type:string, msg:string}>}
 * returns {insertId} incase of success,
 * returns {type, msg} in case of failure
 */
UsersModel.prototype.addNewUser = function(name, email, password) {
  const query = 'insert into store.users(name, email, password)values\
    (?, ?, ?);';
  // if error returns error object, else return object contains insertId
  return this.db.runQuery(query,
      [name, email, password]);
};


/**
 * search for a user in database using his/her email
 * @param {string} email email to search for
 * @returns {Promise<undefined>|
 *         Promise<{id:number, name:string, email:string, password:string}>|
 *         Promise<{type:string, msg:string}>}
 * undefined : if nothing is found,
 * {id, name, email, password} if user is found,
 * {msg,type} if some error occurs
 */
UsersModel.prototype.getUserByEmail = function(email) {
  const query = 'select * from users where email = ?;';
  return this.db.runQuery(query, [email])
      .then( (result)=>{
        if (result.type && result.msg) { // error
          return result;
        }
        return result[0]; // object or undefined if not found
      });
};


/**
 * search for a user in database using his/her id
 * @param {number} id id of the user to search for
 * @returns {Promise<undefined>|
 *         Promise<{id:number, name:string, email:string, password:string}>|
 *         Promise<{type:string, msg:string}>}
 * undefined : if nothing is found,
 * {id, name, email, password} if user is found,
 * {msg,type} if some error occurs
 */
UsersModel.prototype.getUserById = function(id) {
  const query = 'select * from users where id = ?;';
  return this.db.runQuery(query, [id])
      .then( (result)=>{
        if (result.type && result.msg) { // error
          return result;
        }
        return result[0]; // object or undefined if not found
      });
};

module.exports.UsersModel = UsersModel;
