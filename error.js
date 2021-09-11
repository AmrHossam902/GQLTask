

module.exports.throwError = function(type, msg) {
  const err = new Error(msg);
  err.name = type;
  throw err;
};
