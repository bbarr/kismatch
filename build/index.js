'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _kisschema = require('kisschema');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var is = function is(typeName, x) {
  return toString.call(x) === '[object ' + typeName + ']';
};
var resolver = function resolver(data) {
  return new Promise(function (res) {
    return res(data);
  });
};
var rejector = function rejector(data) {
  return new Promise(_, function (rej) {
    return rej(data);
  });
};
var isOdd = function isOdd(n) {
  return n % 2;
};
var last = function last(arr) {
  return arr[arr.length - 1];
};
var first = function first(arr) {
  return arr[0];
};
var init = function init(arr) {
  return arr.slice(0, arr.length - 1);
};
var isFunction = function isFunction(x) {
  return typeof x === 'function';
};
var max = function max(arr) {
  return arr.reduce(function (x, y) {
    return x > y ? x : y;
  }, 0);
};

var toPairs = function toPairs(arr) {
  return arr.reduce(function (pairs, item, i) {
    isOdd(i) ? last(pairs).push(item) : pairs.push([item]);
    return pairs;
  }, []);
};

var test = function test(pattern, data) {
  var count = 0;
  if (isFunction(pattern)) {
    return pattern(data) ? 1 : 0;
  }
  for (var key in pattern) {
    if (pattern.hasOwnProperty(key)) {
      if (isFunction(pattern[key].validate)) {
        if ((0, _kisschema.validate)(_defineProperty({}, key, pattern[key]), _defineProperty({}, key, data[key]))) {
          return 0;
        }
      } else {
        if (is('Object', pattern[key])) {
          if (!data[key]) return 0;
          var sub = test(pattern[key], data[key]);
          if (sub === 0) return 0;else count++;
        } else if (pattern[key] !== data[key]) return 0;
      }
      count++;
    }
  }
  return count;
};

var api = function api() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var groups = toPairs(args);
  var hasDefault = last(groups).length === 1;
  var pairs = hasDefault ? init(groups) : groups;
  var defaultFn = hasDefault ? last(last(groups)) : null;

  return function (payload) {
    for (var _len2 = arguments.length, extraPayload = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      extraPayload[_key2 - 1] = arguments[_key2];
    }

    var payloadArgs = [payload].concat(extraPayload);

    if (!payload) {
      return defaultFn ? defaultFn.apply(undefined, _toConsumableArray(payloadArgs)) : null;
    }

    var scores = pairs.map(function (pair) {
      return test(first(pair), payload);
    });

    var maxScore = max(scores);
    if (maxScore === 0) return defaultFn && defaultFn.apply(undefined, _toConsumableArray(payloadArgs));

    var indexOfBest = scores.indexOf(maxScore);
    var best = pairs[indexOfBest];

    return last(best).apply(undefined, _toConsumableArray(payloadArgs));
  };
};

api.types = _kisschema.types;

exports.default = api;
