const mysql = require('mysql');
const fs = require('fs');

const {
  dbUser,
  dbPassword,
  dbName,
  host,
} = JSON.parse(fs.readFileSync(__dirname + '/dbConfig.json').toString('utf-8'));

/**
 * Interface intended for handling Db connections
 */
function MysqlInterface() {}


/**
 * static function intends to create a single pool and handle the pool
 * whenever it's asked to
 * @return {Object} pool object
 */
MysqlInterface.getPool = function() {
  if (MysqlInterface.pool) {
    return MysqlInterface.pool;
  }
  MysqlInterface.pool = mysql.createPool({
    connectionLimit: 5,
    host,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });
  return MysqlInterface.pool;
};

/**
 * static function for creating an interface object
 * which is responsible for handling queries
 * @return {{runQuery:Function, close:Function}} run query returns a promise
 */
MysqlInterface.createInterface = function() {
  return {
    /**
     * function that runs a query on the database server
     * @param {string} queryString parameterized string for rhe query
     * like "insert into users(name, mail) values(?, ?)"
     * @param {Array} params array containing parameters to be provided
     *  to the query string
     * @return {{type:string, msg:string} | Object}
     * {type, msg } in case of error
     */
    runQuery: function(queryString, params) {
      return new Promise(function(resolve, reject) {
        MysqlInterface.getPool().getConnection( function(err, connection) {
          if (err) {
            reject(err);
            return;
          }
          connection.query(queryString, params, function(err, results) {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
            connection.release();
          });
        });
      }).catch( (reason)=>{
        if (reason.errno == -111) {
          return {
            type: 'SERVER_ERROR',
            msg: 'connection problem with mysql server',
          };
        }
        return {
          type: reason.code,
          msg: reason.message,
        };
      });
    },
    close: function() {
      MysqlInterface.pool.close();
    },
  };
};


module.exports.createInterface = MysqlInterface.createInterface;
