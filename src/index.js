
import { types, validate } from 'kisschema'

var resolver = data => new Promise(res => res(data))
var rejector = data => new Promise(_, rej => rej(data))
var isOdd = n => n % 2
var last = arr => arr[arr.length - 1]
var first = arr => arr[0]
var init = arr => arr.slice(0, arr.length - 1)
var isFunction = x => typeof x === 'function'
var max = arr => arr.reduce((x, y) => x > y ? x : y, 0)

var toPairs = (arr) => {
  return arr.reduce((pairs, item, i) => {
    isOdd(i) ? last(pairs).push(item) : pairs.push([ item ])
    return pairs
  }, [])
}


var test = (pattern, data) => {
  var count = 0
  for (var key in pattern) {
    if (pattern.hasOwnProperty(key)) {
      if (isFunction(pattern[key].validate)) {
        if (!pattern[key].validate(data[key])) {
          return 0
        }
      } else if (pattern[key] !== data[key]) return 0
      count++
    }
  }
  return count
}

var api = (...args) => {

  var groups = toPairs(args)
  var hasDefault = last(groups).length === 1
  var pairs = hasDefault ? init(groups) : groups
  var defaultFn = hasDefault ? last(last(groups)) : null

  return (payload) => {

    var scores = pairs.map(pair => test(first(pair), payload))

    var maxScore = max(scores)
    if (maxScore === 0) 
      return defaultFn && defaultFn(payload)

    var indexOfBest = scores.indexOf(maxScore)
    var best = pairs[indexOfBest]

    return last(best)(payload)
  }
}

api.types = types

export default api
