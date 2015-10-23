'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var toString = Object.prototype.toString;
var is = function is(typeName, x) {
  return toString.call(x) === '[object ' + typeName + ']';
};
var isArray = is.bind(null, 'Array');
var isObject = is.bind(null, 'Object');
var isNumber = is.bind(null, 'Number');
var isFunction = is.bind(null, 'Function');
var isBoolean = is.bind(null, 'Boolean');
var isString = is.bind(null, 'String');
var isNull = is.bind(null, 'Null');
var isUndefined = is.bind(null, 'Undefined');
var existy = function existy(x) {
  return !isNull(x) && !isUndefined(x);
};
var values = function values(obj) {
  return _Object$keys(obj).reduce(function (vals, key) {
    return vals.concat(obj[key]);
  }, []);
};

var makeRequirable = function makeRequirable(type) {
  return _Object$assign(type, {
    isRequired: {
      isRequiring: true,
      next: type,
      validate: function validate(x) {
        return existy(x);
      },
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' must not be null or undefined';
      }
    }
  });
};

// return "type" object for validation.. used for testing schema's as standalone props
var asType = function asType(obj) {
  if (obj.validate) return obj;
  return {
    validate: (function (_validate) {
      function validate(_x) {
        return _validate.apply(this, arguments);
      }

      validate.toString = function () {
        return _validate.toString();
      };

      return validate;
    })(function (x) {
      return !validate(obj, x);
    }),
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should match schema: ' + JSON.stringify(obj);
    }
  };
};

var types = {

  string: makeRequirable({
    validate: function validate(x) {
      return isString(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be of type: string';
    }
  }),

  number: makeRequirable({
    validate: function validate(x) {
      return isNumber(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be of type: number';
    }
  }),

  bool: makeRequirable({
    validate: function validate(x) {
      return isBoolean(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be of type: boolean';
    }
  }),

  object: makeRequirable({
    validate: function validate(x) {
      return isObject(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be of type: object';
    }
  }),

  array: makeRequirable({
    validate: function validate(x) {
      return isArray(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be of type: array';
    }
  }),

  func: makeRequirable({
    validate: function validate(x) {
      return isFunction(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be of type: function';
    }
  }),

  oneOf: function oneOf() {
    var possibilities = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return makeRequirable({
      validate: function validate(x) {
        return possibilities.indexOf(x) > -1;
      },
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' should match one of: ' + JSON.stringify(possibilities);
      }
    });
  },

  oneOfType: function oneOfType() {
    var schemaOrTypes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var types = schemaOrTypes.map(asType);
    return makeRequirable({
      validate: function validate(x) {
        return types.some(function (type) {
          return type.validate(x);
        });
      },
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' should be one of type: ' + schemaOrTypes.map(function (st) {
          return st.toString();
        });
      }
    });
  },

  arrayOf: function arrayOf() {
    var schemaOrType = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var type = asType(schemaOrType);
    return makeRequirable({
      validate: function validate(x) {
        return x.every(function (y) {
          return type.validate(y);
        });
      },
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' should be an array containing items of type: ' + schemaOrType.toString();
      }
    });
  },

  objectOf: function objectOf() {
    var schemaOrType = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var type = asType(schemaOrType);
    return makeRequirable({
      validate: function validate(x) {
        return values(x).every(function (y) {
          return type.validate(y);
        });
      },
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' should be an object containing items of type: ' + schemaOrType.toString();
      }
    });
  },

  instanceOf: function instanceOf() {
    var Constructor = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

    return makeRequirable({
      validate: function validate(x) {
        return x instanceof Constructor;
      },
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' should be an instance of ' + Constructor.toString();
      }
    });
  },

  shape: function shape() {
    var schema = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return makeRequirable({
      validate: (function (_validate2) {
        function validate(_x2) {
          return _validate2.apply(this, arguments);
        }

        validate.toString = function () {
          return _validate2.toString();
        };

        return validate;
      })(function (x) {
        return !validate(schema, x);
      }),
      makeErrorMessage: function makeErrorMessage(ctx, x) {
        return ctx.prop + ' should match shape/schema ' + schema.toString();
      }
    });
  },

  custom: function custom() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var errors = validate({
      validate: types.func.isRequired,
      makeErrorMessage: types.func.isRequired
    }, type);
    if (errors) throw new Error(errors);
    return makeRequirable(type);
  },

  any: makeRequirable({
    validate: function validate(x) {
      return existy(x);
    },
    makeErrorMessage: function makeErrorMessage(ctx, x) {
      return ctx.prop + ' should be "any"thing... just not undefined or null';
    }
  })
};

var validateType = function validateType(errors, ctx, type, val) {
  if (!existy(val) && !type.isRequiring) return errors;
  var passed = type.validate(val);
  return passed ? errors : errors.concat(type.makeErrorMessage(ctx, val));
};

var validate = function validate(schema, obj) {
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var errors = _Object$keys(schema).reduce(function (errors, key) {
    var ctx = { prop: key };
    var type = schema[key];
    if (opts.failFast && errors.length) return errors;
    var newErrors = validateType(errors, ctx, type, obj[key]);
    if (opts.failFast && newErrors.length) return newErrors;
    while (type.next) {
      type = type.next;
      newErrors = validateType(newErrors, ctx, type, obj[key]);
    }
    return newErrors;
  }, []);

  return errors.length ? errors : null;
};

exports['default'] = {
  types: types,
  validate: validate
};
module.exports = exports['default'];
