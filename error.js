

module.exports.throwError = function(type, msg) {
  let err = new Error(msg);
    err.name = type;
    throw err;
}
