/* eslint-disable no-multi-str */

/**
 * function that validates email input before
 * insertion in database
 * @param {string} email email string to be validated
 * @return {{type:string, msg:string}|{ok:string}}
 */
function validateEmail(email) {
  if (email.length >50) {
    return {
      type: 'INPUT_LENGTH_ERROR',
      msg: 'email can\'t have more than 50 chars',
    };
  }


  // check that all characters are alphanumeric latin and special chars
  let results = email.match(/[^a-zA-Z0-9~!@#\\$<%^&*()\-_=+?."'[\]{}><]/g);
  if (results) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'email must contain only A-Z, a-z,\
       0-9 and special characters like #,$,%,...',
    };
  }

  // check existence of @ char
  results = email.match(/@/g);
  if (!results) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'email must contain @ separator',
    };
  }


  // investigate domain and local parts
  const parts = email.split('@');
  const domain = parts.pop();
  const local = parts.join('@');

  // ---------------validate domain-----------------
  // domain can't be empty
  if (domain.length == 0) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'Domain part can\'t be empty',
    };
  }

  // validate domain chars
  if ( (/[^a-zA-Z0-9-.]+/g).test(domain) ) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'Domain part may only contain (a-z), (A-Z), (0-9), (.) and (-)',
    };
  }

  // validate domain labels
  results = domain.split('.');

  let error = null;
  results.forEach( (element) => {
    if (element == '') {
      error = {
        type: 'INPUT_FORMAT_ERROR',
        msg: 'Domain labels can\'t start or end with a period',
      };
      return;
    }

    if ( (/^-|-$/).test(element)) {
      error = {
        type: 'INPUT_FORMAT_ERROR',
        msg: 'Domain labels can\'t start or end with a (-)',
      };
      return;
    }
  });

  if (error) {
    return error;
  }


  // ----------------validating the local part--------------
  if (local.length == 0) {
    return {
      type: 'INCORRECT_FORMAT',
      msg: 'local part can\'t be empty',
    };
  }

  // check some illeagal cases
  if ( (/[^A-Za-z0-9!#$%&'*+-/=?^_`{|}~]/).test(local) ) {
    // check if local is bounded by ""
    if (local.charAt(0) != '"' || local.charAt(local.length-1) != '"') {
      return {
        type: 'INPUT_FORMAT_ERROR',
        msg: 'for local part containing\
         ("(),:;<>@[]) or "..", it must be enclosed by ""',
      };
    }
  }

  if (local[0] == '.' || local[local.length-1] == '.') {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'local email part can\'t start or end with a \'.\' ',
    };
  }

  return {
    OK: 'OK',
  };
}

/**
 * function that validates input password before insertion in database
 * @param {string} password input password
 * @param {string} confirmationPassword input confirm password
 * @return {{type:string, msg:string}|{ok:string}}
 */
function validatePassword(password, confirmationPassword) {
  if (password.length < 8) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'password must be at least 8 characters length',
    };
  }

  if ( !(/[A-Z]/g).test(password) ) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'password must contain at least one capital-case char',
    };
  }

  if ( !(/[a-z]/g).test(password) ) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'password must contain at least one small-case char',
    };
  }

  if ( !(/[0-9]/g).test(password) ) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'password must contain at least one digit',
    };
  }

  if ( !(/[!@#$%^&*+()-_{}"'\\:;?,<>_~|]/g).test(password) ) {
    return {
      type: 'INPUT_FORMAT_ERROR',
      msg: 'password must contain at least one special-case(@,$,&,...) char',
    };
  }


  if (password != confirmationPassword) {
    return {
      type: 'PASSWORD_CONFIRM_ERROR',
      msg: 'password and its confirmation must be the same',
    };
  }

  return {OK: 'OK'};
}

/**
 * function that validates name string before insertion in database
 * @param {string} name input name string
 * @return {{type:string, msg:string}|{ok:string}}
 */
function validateName(name) {
  if (name.length > 50) {
    return {
      type: 'INPUT_LENGTH_ERROR',
      msg: 'name can\'t have more than 50 chars',
    };
  } else if (name.length == 0) {
    return {
      type: 'INPUT_LENGTH_ERROR',
      msg: 'name can\'t be empty string',
    };
  }

  return {OK: 'OK'};
}


module.exports = {
  validateEmail, validatePassword, validateName,
};
