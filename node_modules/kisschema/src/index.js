
var toString = Object.prototype.toString
var is = (typeName, x) => toString.call(x) === `[object ${typeName}]`
var isArray = is.bind(null, 'Array')
var isObject = is.bind(null, 'Object')
var isNumber = is.bind(null, 'Number')
var isFunction = is.bind(null, 'Function')
var isBoolean = is.bind(null, 'Boolean')
var isString = is.bind(null, 'String')
var isNull = is.bind(null, 'Null')
var isUndefined = is.bind(null, 'Undefined')
var existy = (x) => !isNull(x) && !isUndefined(x)
var values = (obj) => Object.keys(obj).reduce((vals, key) => vals.concat(obj[key]), [])

var makeRequirable = (type) => {
  return Object.assign(type, {
    isRequired: {
      isRequiring: true,
      next: type,
      validate: (x) => existy(x),
      makeErrorMessage: (ctx, x) => `${ctx.prop} must not be null or undefined`
    }
  })
}

// return "type" object for validation.. used for testing schema's as standalone props
var asType = (obj) => {
  if (obj.validate) return obj
  return {
    validate: (x) => !validate(obj, x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should match schema: ${JSON.stringify(obj)}`
  }
}

var types = {

  string: makeRequirable({
    validate: (x) => isString(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: string`
  }),

  number: makeRequirable({
    validate: (x) => isNumber(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: number`
  }),

  bool: makeRequirable({
    validate: (x) => isBoolean(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: boolean`
  }),

  object: makeRequirable({
    validate: (x) => isObject(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: object`
  }),

  array: makeRequirable({
    validate: (x) => isArray(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: array`
  }),

  func: makeRequirable({
    validate: (x) => isFunction(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: function`
  }),

  oneOf(possibilities=[]) {
    return makeRequirable({
      validate: (x) => possibilities.indexOf(x) > -1,
      makeErrorMessage: (ctx, x) => `${ctx.prop} should match one of: ${JSON.stringify(possibilities)}`
    })
  },

  oneOfType(schemaOrTypes=[]) {
    var types = schemaOrTypes.map(asType)
    return makeRequirable({
      validate: (x) => types.some((type) => type.validate(x)),
      makeErrorMessage: (ctx, x) => `${ctx.prop} should be one of type: ${schemaOrTypes.map((st) => st.toString())}`
    })
  },

  arrayOf(schemaOrType={}) {
    var type = asType(schemaOrType)
    return makeRequirable({
      validate: (x) => x.every((y) => type.validate(y)),
      makeErrorMessage: (ctx, x) => `${ctx.prop} should be an array containing items of type: ${schemaOrType.toString()}`
    })
  },

  objectOf(schemaOrType={}) {
    var type = asType(schemaOrType)
    return makeRequirable({
      validate: (x) => values(x).every((y) => type.validate(y)),
      makeErrorMessage: (ctx, x) => `${ctx.prop} should be an object containing items of type: ${schemaOrType.toString()}`
    })
  },

  instanceOf(Constructor=function() {}) {
    return makeRequirable({
      validate: (x) => x instanceof Constructor,
      makeErrorMessage: (ctx, x) => `${ctx.prop} should be an instance of ${Constructor.toString()}`
    })
  },

  shape(schema={}) {
    return makeRequirable({
      validate: (x) => !validate(schema, x),
      makeErrorMessage: (ctx, x) => `${ctx.prop} should match shape/schema ${schema.toString()}`
    })
  },

  custom(type={}) {
    var errors = validate({ 
      validate: types.func.isRequired, 
      makeErrorMessage: types.func.isRequired 
    }, type)
    if (errors) throw new Error(errors)
    return makeRequirable(type)
  },

  any: makeRequirable({
    validate: (x) => existy(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be "any"thing... just not undefined or null`
  })
}

var validateType = (errors, ctx, type, val) => {
  if (!existy(val) && !type.isRequiring) return errors
  var passed = type.validate(val)
  return passed ? errors : errors.concat(type.makeErrorMessage(ctx, val))
}

var validate = (schema, obj, opts={}) => {

  var errors = Object.keys(schema).reduce((errors, key) => {
    var ctx = { prop: key }
    var type = schema[key]
    if (opts.failFast && errors.length) return errors
    var newErrors = validateType(errors, ctx, type, obj[key])
    if (opts.failFast && newErrors.length) return newErrors
    while (type.next) {
      type = type.next
      newErrors = validateType(newErrors, ctx, type, obj[key])
    }
    return newErrors
  }, [])

  return errors.length ? errors : null
}

export default {
  types,
  validate
}
