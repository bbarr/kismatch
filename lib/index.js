
const toString = Object.prototype.toString
const is = (typeName, x) => toString.call(x) === `[object ${typeName}]`
const isArray = is.bind(null, 'Array')
const isObject = is.bind(null, 'Object')
const isNumber = is.bind(null, 'Number')
const isFunction = is.bind(null, 'Function')
const isBoolean = is.bind(null, 'Boolean')
const isString = is.bind(null, 'String')
const isNull = is.bind(null, 'Null')
const isUndefined = is.bind(null, 'Undefined')
const existy = x => !isNull(x) && !isUndefined(x)
const values = obj => Object.keys(obj).reduce((vals, key) => vals.concat(obj[key]), [])
const resolver = data => new Promise(res => res(data))
const rejector = data => new Promise(_, rej => rej(data))
const isOdd = n => n % 2
const last = arr => arr[arr.length - 1]
const first = arr => arr[0]
const init = arr => arr.slice(0, arr.length - 1)
const max = arr => arr.reduce((x, y) => x > y ? x : y, 0)

function makeRequirable(type) {
  return {
    ...type,
    isRequired: {
      isRequiring: true,
      next: type,
      validate: (x) => existy(x),
      makeErrorMessage: (ctx, x) => `${ctx.prop} must not be null or undefined`,
      toJSON: () => ({ required: true, ...type.toJSON() })
    }
  }
}

function asType(obj) {
  if (obj.validate) return obj

  const type = {
    validate: (x) => !validate(obj, x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should match schema: ${type.toJSON()}`,
    toJSON: () => JSON.stringify(obj)
  }

  return type
}

export const types = {

  string: makeRequirable({
    validate: (x) => isString(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: string`,
    toJSON: () => ({ type: 'string' })
  }),

  number: makeRequirable({
    validate: (x) => isNumber(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: number`,
    toJSON: () => ({ type: 'number' })
  }),

  bool: makeRequirable({
    validate: (x) => isBoolean(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: bool`,
    toJSON: () => ({ type: 'bool' })
  }),

  object: makeRequirable({
    validate: (x) => isObject(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: object`,
    toJSON: () => ({ type: 'object' })
  }),

  array: makeRequirable({
    validate: (x) => isArray(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: array`,
    toJSON: () => ({ type: 'array' })
  }),

  func: makeRequirable({
    validate: (x) => isFunction(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be of type: func`,
    toJSON: () => ({ type: 'func' })
  }),

  oneOf(possibilities=[]) {

    const type = makeRequirable({
      validate: (x) => possibilities.indexOf(x) > -1,
      makeErrorMessage: (ctx, x) => type.toJSON(),
      toJSON: () => ({ oneOf: possibilities })
    })

    return type
  },

  oneOfType(schemaOrTypes=[]) {

    const subs = schemaOrTypes.map(asType)

    const type = makeRequirable({
      validate: (x) => subs.some(sub => sub.validate(x)),
      makeErrorMessage: (ctx, x) => type.toJSON(),
      toJSON: () => ({ oneOfType: schemaOrTypes.map((st) => st.toJSON()) })
    })

    return type
  },

  arrayOf(schemaOrType={}) {
    const sub = asType(schemaOrType)

    const type = makeRequirable({
      validate: (x) => x.every((y) => sub.validate(y)),
      makeErrorMessage: () => type.toJSON(),
      toJSON: () => ({ arrayOf: sub.toJSON() })
    })

    return type
  },

  objectOf(schemaOrType={}) {

    const sub = asType(schemaOrType)

    const type = makeRequirable({
      validate: (x) => values(x).every((y) => sub.validate(y)),
      makeErrorMessage: (ctx, x) => type.toJSON(),
      toJSON: () => ({ objectOf: sub.toJSON() })
    })

    return type
  },

  instanceOf(Constructor=function() {}) {

    const type =  makeRequirable({
      validate: (x) => x instanceof Constructor,
      makeErrorMessage: (ctx, x) => `${ctx.prop} should be an instance of ${type.toJSON()}`,
      toJSON: () => Constructor.toString()
    })

    return type
  },

  shape(schema={}) {

    const type = makeRequirable({
      validate: (x) => !validate(schema, x),
      makeErrorMessage: (ctx, x={}) => {
        return Object.keys(schema).reduce((memo, key) => {
          const result = validate({ [key]: schema[key] }, { [key]: x[key] })
          if (!result) return memo
          return Object.assign({}, memo, result)
        }, {})
      },
      toJSON: () => Object.keys(schema).reduce((memo, key) => {
        return Object.assign({}, memo, { [key]: schema[key].toJSON() })
      }, {})
    })

    return type
  },

  custom(type={}) {
    const errors = validate({
      validate: types.func.isRequired,
      makeErrorMessage: types.func.isRequired,
      toJSON: types.func
    }, type)
    if (errors) throw new Error(errors)
    return makeRequirable(Object.assign({ toJSON: () => 'custom type - define a "toJSON" function for a better message here' }, type))
  },

  any: makeRequirable({
    validate: (x) => existy(x),
    makeErrorMessage: (ctx, x) => `${ctx.prop} should be "any"thing... just not undefined or null`
  })
}

function validateType(errors, ctx, type, val, key) {
  if (!existy(val) && !type.isRequiring) return errors
  const passed = type.validate(val)
  return passed ? errors : Object.assign({}, errors, { [key]: type.makeErrorMessage(ctx, val) })
}

export function validate(schema, obj, opts={}) {

  const errors = Object.keys(schema).reduce((errors, key) => {
    const ctx = { prop: key }
    let type = schema[key]
    if (opts.failFast && Object.keys(errors).length) return errors
    let newErrors = validateType(errors, ctx, type, obj[key], key)
    if (opts.failFast && Object.keys(newErrors).length) return newErrors
    while (type.next) {
      type = type.next
      newErrors = validateType(newErrors, ctx, type, obj[key], key)
    }
    return newErrors
  }, {})

  return Object.keys(errors).length ? errors : null
}

export function enforce(schema, obj, opts) {
  const errors = validate(schema, obj, opts)
  if (errors) return new Error(JSON.stringify(errors))
  return obj
}

function toPairs(arr) {
  return arr.reduce((pairs, item, i) => {
    isOdd(i) ? last(pairs).push(item) : pairs.push([ item ])
    return pairs
  }, [])
}

function test(pattern, data) {
  let count = 0
  if (isFunction(pattern)) {
    return pattern(data) ? 1 : 0
  }
  for (let key in pattern) {
    if (pattern.hasOwnProperty(key)) {
      if (isFunction(pattern[key].validate)) {
        if (validate({ [key]: pattern[key] }, { [key]: data[key] })) {
          return 0
        }
      } else {
        if (is('Object', pattern[key])) {
          if (!data[key]) return 0
          const sub = test(pattern[key], data[key])
          if (sub === 0) return 0
          else count++
        } else if (pattern[key] !== data[key]) return 0
      }
      count++
    }
  }
  return count
}

export function match(...args) {

  const groups = toPairs(args)
  const hasDefault = last(groups).length === 1
  const pairs = hasDefault ? init(groups) : groups
  const defaultFn = hasDefault ? last(last(groups)) : null

  return (payload, ...extraPayload) => {

    const payloadArgs = [ payload ].concat(extraPayload)

    if (!payload) {
      return defaultFn ? defaultFn(...payloadArgs) : null
    }

    const scores = pairs.map(pair => test(first(pair), payload))

    const maxScore = max(scores)
    if (maxScore === 0) 
      return defaultFn && defaultFn(...payloadArgs)

    const indexOfBest = scores.indexOf(maxScore)
    const best = pairs[indexOfBest]

    return last(best)(...payloadArgs)
  }
}
