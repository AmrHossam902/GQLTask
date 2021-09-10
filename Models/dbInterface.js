const mysql = require('mysql');
const fs = require('fs');

const {
  dbUser,
  dbPassword,
  dbName,
  host,
} = JSON.parse(fs.readFileSync('./keys/keys.json').toString('utf-8'));


function MySqlInterface() {}

MySqlInterface.createInterface = function() {
  if (MySqlInterface.pool) {
    return MySqlInterface.pool;
  }
  return MySqlInterface.pool = mysql.createPool({
    connectionLimit: 5,
    host,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });
};

MySqlInterface.promisifiedQuery = function(queryString, params){
    return new Promise(function(resolve, reject){
        
        pool.getConnection( function(err, connection){
            if(err){
                reject(err);
                return;
            }
            connection.query(queryString, params, function(err, results){
                if(err)
                    reject(err);
                else
                    resolve(results);
                connection.release();
            });

        });
    })
    .catch( (reason)=>{
        if(reason.errno == -111){
            return {
                type : 'SERVER_ERROR',
                msg : 'connection problem with mysql server'
            };
        }
        return {
            type : reason.code,
            msg : reason.message
        };
   });
};