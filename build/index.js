'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _kisschema = require('kisschema');

var resolver = function resolver(data) {
  return new _Promise(function (res) {
    return res(data);
  });
};
var rejector = function rejector(data) {
  return new _Promise(_, function (rej) {
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
  for (var key in pattern) {
    if (pattern.hasOwnProperty(key)) {
      if (isFunction(pattern[key].validate)) {
        if (!pattern[key].validate(data[key])) {
          return 0;
        }
      } else if (pattern[key] !== data[key]) return 0;
      count++;
    }
  }
  return count;
};

var api = function api() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var pairs = toPairs(args);

  return function (payload) {

    var scores = pairs.map(function (pair) {
      return test(first(pair), payload);
    });

    var maxScore = max(scores);
    if (maxScore === 0) return null;

    var indexOfBest = scores.indexOf(maxScore);
    var best = pairs[indexOfBest];

    return last(best)(payload);
  };
};

api.types = _kisschema.types;

exports['default'] = api;
module.exports = exports['default'];
